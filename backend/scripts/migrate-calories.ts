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

async function fetchSpoonacularCalories(title: string, ingredients: string[]): Promise<number | null> {
  const apiKey = process.env.SPOONACULAR_API_KEY;

  if (!apiKey || apiKey === 'DEIN_SPOONACULAR_KEY_HIER_EINTRAGEN') {
    console.warn('Spoonacular API Key fehlt in .env');
    return null;
  }

  try {
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
      const caloriesNutrient = data.nutrition?.nutrients?.find((n: any) => n.name === 'Calories');
      return caloriesNutrient ? Math.round(caloriesNutrient.amount) : null;
    }
  } catch (e) {
    console.error(`Fehler bei Spoonacular Abfrage: ${e.message}`);
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
    const totalCalories = await fetchSpoonacularCalories(recipe.title, translated);

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
    
    // Kleiner Sleep um Rate Limits zu vermeiden (Spoonacular Free Tier: 1 req/sec)
    await new Promise(resolve => setTimeout(resolve, 3000));
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
