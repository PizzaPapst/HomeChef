import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  
  private readonly OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
  private readonly GEMINI_KEY = process.env.GEMINI_API_KEY; // Liest den Key

  async parseRecipeFromHtml(textContext: string): Promise<any> {
    const cleanText = textContext.replace(/\s+/g, ' ').substring(0, 15000);

    // Prompt bleibt fast gleich, wir bitten aber explizit um JSON ohne Markdown
    const prompt = `
      Du bist ein Parser für Rezepte. Extrahiere strukturierte Daten aus dem Text.
      Antworte NUR mit validem JSON. Keine Markdown-Formatierung (\`\`\`json), kein Text davor/danach.
      
      Struktur:
      {
        "name": "Gericht Name",
        "description": "Beschreibung",
        "recipeYield": 4,
        "prepTime": "PT30M", 
        "totalTime": "PT60M",
        "recipeIngredient": ["Zutat 1", "Zutat 2"],
        "recipeInstructions": ["Schritt 1", "Schritt 2"]
      }
      
      Text:
      ${cleanText}
    `;

    // ENTSCHEIDUNG: Google oder Ollama?
    if (this.GEMINI_KEY) {
        return this.askGemini(prompt);
    } else {
        return this.askOllama(prompt);
    }
  }

  // --- GOOGLE GEMINI STRATEGIE ---
  private async askGemini(prompt: string) {
      this.logger.log('Nutze Google Gemini Cloud...');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.GEMINI_KEY}`;

      try {
          const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  contents: [{
                      parts: [{ text: prompt }]
                  }],
                  generationConfig: {
                      responseMimeType: "application/json" // Gemini Feature: Garantiert JSON!
                  }
              })
          });

          const data = await response.json();

          if (data.error) {
              throw new Error(data.error.message);
          }

          // Gemini Antwort Struktur parsen
          const textResponse = data.candidates[0].content.parts[0].text;
          const parsed = JSON.parse(textResponse);
          
          this.logger.log(`Gemini Erfolg: "${parsed.name}"`);
          return parsed;

      } catch (error) {
          this.logger.error('Gemini Fehler:', error);
          return null;
      }
  }

  // --- OLLAMA STRATEGIE (Fallback) ---
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
          format: 'json'
        }),
      });

      const data = await response.json();
      if (!data.response) throw new Error('Empty response');
      
      const parsed = JSON.parse(data.response);
      this.logger.log(`Ollama Erfolg: "${parsed.name}"`);
      return parsed;
    } catch (error) {
      this.logger.error('Ollama Fehler:', error);
      return null;
    }
  }
}