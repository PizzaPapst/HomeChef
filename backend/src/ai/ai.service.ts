import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  
  // WICHTIG: Wenn dein NestJS lokal läuft und Ollama in Docker: 'http://localhost:11434'
  // Wenn beides in Docker läuft: 'http://ollama:11434'
  private readonly OLLAMA_URL = 'http://localhost:11434/api/generate'; 

  async parseRecipeFromHtml(textContext: string): Promise<any> {
    this.logger.log('Starte KI-Analyse des Textes...');

    // Text kürzen, um Token-Limit und Performance zu schonen (erste 10.000 Zeichen reichen meist)
    const cleanText = textContext.replace(/\s+/g, ' ').substring(0, 10000);

    const prompt = `
      Du bist ein Parser für Rezepte. Extrahiere strukturierte Daten aus dem folgenden Text.
      Antworte AUSSCHLIESSLICH mit validem JSON.
      
      Die JSON-Struktur MUSS so aussehen (Schema.org Stil):
      {
        "name": "Name des Gerichts",
        "description": "Kurzbeschreibung",
        "recipeYield": 4,
        "prepTime": "PT30M", 
        "totalTime": "PT60M",
        "recipeIngredient": ["500g Mehl", "2 Eier", "Salz"],
        "recipeInstructions": ["Schritt 1...", "Schritt 2..."]
      }

      Falls Informationen fehlen (z.B. Zeit), setze sie auf null oder schätze konservativ.
      Falls absolut kein Rezept im Text zu finden ist, antworte mit {"error": "no recipe found"}.

      Hier ist der Text:
      ${cleanText}
    `;

    try {
      // Wir nutzen fetch (Node 18+ Standard)
      const response = await fetch(this.OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'ministral-3:3b', // Stelle sicher, dass du 'docker exec -it rezept_ai ollama run llama3' gemacht hast!
          prompt: prompt,
          stream: false,
          format: 'json' // Zwingt Ollama zu JSON
        }),
      });

      const data = await response.json();
      
      if (!data.response) {
        throw new Error('Leere Antwort von Ollama');
      }

      const parsed = JSON.parse(data.response);
      
      if (parsed.error) {
          this.logger.warn('KI konnte kein Rezept finden.');
          return null;
      }

      this.logger.log(`KI hat Rezept extrahiert: "${parsed.name}"`);
      return parsed;

    } catch (error) {
      this.logger.error('KI Verbindung fehlgeschlagen (Läuft der Container?):', error.message);
      return null;
    }
  }
}