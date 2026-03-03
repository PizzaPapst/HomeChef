import { Injectable, Logger } from '@nestjs/common';
import { SEARCHABLE_BASE_INGREDIENTS, INGREDIENT_BLACKLIST } from '../recipes/ingredient-config';
import * as fs from 'fs';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor() {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      this.logger.log(
        `✅ Gemini API Key gefunden! (Startet mit: ${key.substring(0, 5)}...)`,
      );
    } else {
      this.logger.warn(
        '❌ Kein Gemini API Key gefunden. Nutze Fallback auf Ollama.',
      );
    }
  }

  private readonly OLLAMA_URL =
    process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
  private readonly GEMINI_KEY = process.env.GEMINI_API_KEY;

  async parseRecipeFromSocialMedia(
    metadata: { title: string; description: string },
    transcript: string | null,
  ): Promise<any> {
    const transcriptSection = transcript
      ? `\n        Gesprochener Videoinhalt (Whisper-Transkript):\n        ${transcript.substring(0, 8000)}`
      : '';

    const prompt = `
        Du bist ein Experte für Rezept-Analyse. Extrahiere strukturierte Rezeptdaten.
        Antworte NUR mit validem JSON ohne Markdown-Formatierung.

        Gewünschte JSON-Struktur:
        {
          "name": "Name des Gerichts",
          "description": "Kurze Beschreibung des Gerichts in 1-2 Sätzen",
          "recipeYield": 4,
          "prepTime": "PT30M",
          "recipeIngredient": [
            "500 g Mehl",
            "280 ml lauwarmes Wasser",
            "1/2 Würfel frische Hefe",
            "3 EL Olivenöl"
          ],
          "recipeInstructions": [
            "Schritt 1: Mehl in eine Schüssel geben...",
            "Schritt 2: Hefe im Wasser auflösen..."
          ]
        }

        WICHTIGE REGELN:
        - recipeIngredient: IMMER als Array von STRINGS im Format "Menge Einheit Zutat"
        - recipeInstructions: IMMER als Array von STRINGS mit vollständigen Schritten
        - prepTime: Im ISO-8601 Format (z.B. "PT30M" = 30 Minuten)
        - Falls Infos fehlen: sinnvolle Defaults verwenden (recipeYield: 4, prepTime: "PT30M")
        - Nutze ALLE verfügbaren Quellen (Beschreibung + Transkript falls vorhanden)

        Videotitel: ${metadata.title}
        Videobeschreibung:
        ${metadata.description}${transcriptSection}
      `;

    if (this.GEMINI_KEY) {
      return this.askGemini(prompt, null);
    } else {
      return this.askOllama(prompt);
    }
  }

  async parseRecipeFromHtml(textContext: string): Promise<any> {
    const cleanText = textContext.replace(/\s+/g, ' ').substring(0, 15000);
    const prompt = `
        Du bist ein Experte für Rezept-Analyse. Extrahiere strukturierte Daten aus dem Text.
        Antworte NUR mit validem JSON.
        
        Struktur:
        {
          "name": "Gericht Name",
          "recipeYield": 4,
          "prepTime": "PT30M", 
          "recipeIngredient": [
            { "name": "500g Kartoffeln, festkochend", "base_ingredient": "Kartoffel" },
            { "name": "Prise Salz", "base_ingredient": null }
          ],
          "recipeInstructions": ["Schritt 1", "Schritt 2"]
        }
        
        REGELN für "base_ingredient":
        1. Nutze ausschließlich Begriffe aus dieser Liste (oder null): [${SEARCHABLE_BASE_INGREDIENTS.join(", ")}]
        2. Ignoriere (null setzen) alle Zutaten aus dieser Liste: [${INGREDIENT_BLACKLIST.join(", ")}]
        3. Synonyme/Varianten MÜSSEN auf Begriffe der Liste gemappt werden.
        4. Nutze immer den Singular (Einzahl).
        
        Text:
        ${cleanText}
      `;

    if (this.GEMINI_KEY) {
      return this.askGemini(prompt);
    } else {
      return this.askOllama(prompt);
    }
  }

  async categorizeIngredients(ingredients: string[]): Promise<{ name: string; base_ingredient: string | null }[] | null> {
    if (!ingredients || ingredients.length === 0) return null;

    const prompt = `
      Analysiere diese Liste von Zutaten und ordne jeder Zutat eine "base_ingredient" zu.
      Antworte NUR mit validem JSON in diesem Format:
      [
        { "name": "Zwiebeln, gewürfelt", "base_ingredient": "Zwiebel" },
        { "name": "Salz", "base_ingredient": null }
      ]

      REGELN:
      1. Nutze ausschließlich Begriffe aus dieser Liste (oder null): [${SEARCHABLE_BASE_INGREDIENTS.join(", ")}]
      2. Ignoriere (null setzen) alle Zutaten aus dieser Liste: [${INGREDIENT_BLACKLIST.join(", ")}]
      3. Synonyme/Varianten MÜSSEN auf Begriffe der Liste gemappt werden.
      4. Nutze immer den Singular (Einzahl).

      Zutaten-Liste:
      ${ingredients.join('\n')}
    `;

    try {
      if (this.GEMINI_KEY) {
        return this.askGemini(prompt);
      } else {
        return this.askOllama(prompt);
      }
    } catch (e) {
      return null;
    }
  }

  private async askGemini(prompt: string, audioPath: string | null = null) {
    // Primär: Gemini 2.0 Flash (JSON-Modus), Fallback: Gemma 3 27B (kein JSON-Modus)
    const models = [
      { id: 'gemini-2.0-flash', jsonMode: true },
      { id: 'gemma-3-27b-it', jsonMode: false },
    ];

    const parts: any[] = [{ text: prompt }];
    const hasAudio = audioPath && fs.existsSync(audioPath);

    if (hasAudio) {
      this.logger.log(`Hänge Audio an Request an: ${audioPath}`);
      const audioBase64 = fs.readFileSync(audioPath).toString('base64');
      parts.push({ inline_data: { mime_type: 'audio/mp3', data: audioBase64 } });
    }

    let lastError: any;

    for (const model of models) {
      this.logger.log(`Nutze Modell: ${model.id}`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${this.GEMINI_KEY}`;

      const body: any = { contents: [{ parts }], generationConfig: {} };
      if (model.jsonMode) {
        body.generationConfig.responseMimeType = 'application/json';
      }

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorText = await response.text();
          const errorData = JSON.parse(errorText);
          const status = errorData?.error?.code;

          this.logger.error(`${model.id} Fehler (${status}): ${errorData?.error?.message}`);

          // Nur bei Quota-Fehler (429) → nächstes Modell versuchen
          if (status === 429) {
            this.logger.warn(`Quota erschöpft für ${model.id} → Fallback...`);
            lastError = new Error(errorData?.error?.message);
            continue;
          }

          throw new Error(`API Error ${status}: ${errorData?.error?.message}`);
        }

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
          throw new Error('Keine Antwort vom Modell erhalten.');
        }

        const textResponse = data.candidates[0].content.parts[0].text;

        // JSON aus Markdown-Codeblock extrahieren falls nötig (bei Modellen ohne JSON-Modus)
        const cleanJson = textResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        this.logger.log(`✅ Erfolg mit Modell: ${model.id}`);
        return parsed;
      } catch (error: any) {
        if (error.message?.includes('Quota') || error.message?.includes('429')) {
          lastError = error;
          continue;
        }
        this.logger.error(`Fehler mit ${model.id}: ${error.message}`);
        throw error;
      }
    }

    this.logger.error('Alle Modelle erschöpft oder fehlgeschlagen.');
    throw lastError ?? new Error('Keine KI-Modelle verfügbar.');
  }

  private async askOllama(prompt: string) {
    this.logger.log('Nutze lokales Ollama...');
    try {
      const response = await fetch(this.OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          prompt: prompt,
          stream: false,
          format: 'json',
        }),
      });

      const data = await response.json();
      if (!data.response) throw new Error('Empty response');

      const parsed = JSON.parse(data.response);
      this.logger.log(`Ollama Erfolg: "${parsed.name}"`);
      return parsed;
    } catch (error) {
      this.logger.error('Ollama Fehler:', error);
      throw error;
    }
  }
}
