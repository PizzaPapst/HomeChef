import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  async analyzeIngredients(title: string, ingredients: string[]) {
    this.logger.log(`Analyse startet für: ${title}`);
    const translatedIngredients = await this.translateIngredients(ingredients);
    this.logger.log(`Übersetzung fertig: ${translatedIngredients.join(', ')}`);
    const calories = await this.fetchSpoonacularCalories(title, translatedIngredients);
    this.logger.log(`Spoonacular Ergebnis: ${calories} kcal`);
    return { calories };
  }

  private async translateIngredients(ingredients: string[]): Promise<string[]> {
    const deepLKey = process.env.DEEPL_KEY;
    if (!deepLKey || deepLKey === 'DEINE_DEEPL_KEY_HIER_EINTRAGEN') {
      this.logger.warn('DeepL API Key nicht konfiguriert. Nutze Originalnamen.');
      return ingredients;
    }

    try {
      const response = await fetch(`https://api-free.deepl.com/v2/translate`, {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${deepLKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: ingredients.join('\n'),
          target_lang: 'EN',
          source_lang: 'DE',
        }),
      });

      if (response.ok) {
        const data: any = await response.json();
        return data.translations[0].text.split('\n');
      }
      this.logger.error(`DeepL API Fehler: ${response.statusText}`);
    } catch (e) {
      this.logger.error(`Fehler bei der DeepL Übersetzung: ${e.message}`);
    }

    return ingredients;
  }

  private async fetchSpoonacularCalories(title: string, ingredients: string[]): Promise<number | null> {
    const apiKey = process.env.SPOONACULAR_API_KEY;

    if (!apiKey || apiKey === 'DEIN_SPOONACULAR_KEY_HIER_EINTRAGEN') {
      this.logger.warn('Spoonacular API Key fehlt in .env');
      return null;
    }

    try {
      this.logger.log(`Sende an Spoonacular: ${JSON.stringify({ title, ingredients })}`);
      
      // Spoonacular "Analyze Recipe" endpoint
      // Wir senden es als JSON POST mit includeNutrition=true
      const response = await fetch(`https://api.spoonacular.com/recipes/analyze?apiKey=${apiKey}&includeNutrition=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          ingredients: ingredients,
        }),
      });

      const data: any = await response.json();

      if (response.ok) {
        // Spoonacular liefert nutrition.nutrients als Array
        // Wir suchen nach "Calories"
        const caloriesNutrient = data.nutrition?.nutrients?.find((n: any) => n.name === 'Calories');
        
        if (caloriesNutrient) {
          return Math.round(caloriesNutrient.amount);
        } else {
          this.logger.warn(`Spoonacular lieferte keine Kalorien zurück.`);
          return null;
        }
      } else {
        this.logger.error(`Spoonacular API Fehler (${response.status}): ${JSON.stringify(data)}`);
      }
    } catch (e) {
      this.logger.error(`Fehler bei Spoonacular Abfrage: ${e.message}`);
    }

    return null;
  }
}
