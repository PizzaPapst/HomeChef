import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  async analyzeIngredients(title: string, ingredients: string[]) {
    this.logger.log(`Analyse startet für: ${title}`);
    const translatedIngredients = await this.translateIngredients(ingredients);
    this.logger.log(`Übersetzung fertig: ${translatedIngredients.join(', ')}`);
    const calories = await this.fetchEdamamCalories(title, translatedIngredients);
    this.logger.log(`Edamam Ergebnis: ${calories} kcal`);
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

  private async fetchEdamamCalories(title: string, ingredients: string[]): Promise<number | null> {
    const appId = process.env.EDAMAM_APP_ID;
    const appKey = process.env.EDAMAM_APP_KEY;

    if (!appId || !appKey) {
      this.logger.warn('Edamam Credentials fehlen in .env');
      return null;
    }

    try {
      this.logger.log(`Sende an Edamam: ${JSON.stringify({ title, ingr: ingredients })}`);
      const response = await fetch(`https://api.edamam.com/api/nutrition-details?app_id=${appId}&app_key=${appKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          ingr: ingredients,
        }),
      });

      const data: any = await response.json();

      if (response.ok) {
        // Fallback-Kette: 1. data.calories | 2. data.totalNutrients.ENERC_KCAL | 3. Summe der Einzelzutaten
        let totalCalories = data.calories;

        if (!totalCalories && data.totalNutrients?.ENERC_KCAL?.quantity) {
          totalCalories = data.totalNutrients.ENERC_KCAL.quantity;
        }

        if (!totalCalories && data.ingredients) {
          totalCalories = data.ingredients.reduce((acc: number, ing: any) => {
            const kcal = ing.parsed?.[0]?.nutrients?.ENERC_KCAL?.quantity || 0;
            return acc + kcal;
          }, 0);
        }

        if (totalCalories !== undefined && totalCalories !== null && totalCalories > 0) {
          return Math.round(totalCalories);
        } else {
          this.logger.warn(`Edamam lieferte keine brauchbaren Kalorien zurück. Body-Keys: ${Object.keys(data).join(', ')}`);
          return null;
        }
      } else {
        this.logger.error(`Edamam API Fehler (${response.status}): ${JSON.stringify(data)}`);
      }
    } catch (e) {
      this.logger.error(`Fehler bei Edamam Abfrage: ${e.message}`);
    }

    return null;
  }
}
