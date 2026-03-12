import { PrismaClient } from '@prisma/client';
import "dotenv/config";

const prisma = new PrismaClient();

async function translateIngredients(ingredients: string[]): Promise<string[]> {
  const deepLKey = process.env.DEEPL_KEY;
  if (!deepLKey || deepLKey === 'DEINE_DEEPL_KEY_HIER_EINTRAGEN') {
    console.warn('DeepL API Key nicht konfiguriert. Nutze Originalnamen.');
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
  } catch (e) {
    console.error(`Fehler bei der DeepL Übersetzung: ${e.message}`);
  }

  return ingredients;
}

async function fetchEdamamCalories(title: string, ingredients: string[]): Promise<number | null> {
  const appId = process.env.EDAMAM_APP_ID;
  const appKey = process.env.EDAMAM_APP_KEY;

  if (!appId || !appKey) {
    console.warn('Edamam Credentials fehlen in .env');
    return null;
  }

  try {
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
      return totalCalories ? Math.round(totalCalories) : null;
    }
  } catch (e) {
    console.error(`Fehler bei Edamam Abfrage: ${e.message}`);
  }

  return null;
}

async function main() {
  console.log('Starte Kalorien-Migration...');
  
  const recipes = await prisma.recipe.findMany({
    include: { ingredients: true },
    where: { 
        OR: [
            { calories: null },
            { calories: 0 }
        ]
    }
  });

  console.log(`${recipes.length} Rezepte gefunden, die aktualisiert werden müssen.`);

  for (const recipe of recipes) {
    console.log(`Verarbeite: ${recipe.title}...`);
    
    const ingredientNames = recipe.ingredients.map(ing => 
      `${ing.amount || ''} ${ing.unit || ''} ${ing.name}`.trim()
    );

    const translated = await translateIngredients(ingredientNames);
    const totalCalories = await fetchEdamamCalories(recipe.title, translated);

    if (totalCalories) {
      const caloriesPerServing = Math.round(totalCalories / recipe.servings);
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: { calories: caloriesPerServing }
      });
      console.log(`✅ ${recipe.title}: ${caloriesPerServing} kcal pro Portion gespeichert.`);
    } else {
      console.log(`❌ ${recipe.title}: Kalorien konnten nicht berechnet werden.`);
    }
    
    // Kleiner Sleep um Rate Limits zu vermeiden
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('Migration abgeschlossen!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
