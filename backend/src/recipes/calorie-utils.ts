// backend/src/recipes/calorie-utils.ts

/**
 * Basic calorie database (kcal per 100g or per unit)
 */
export const INGREDIENT_KCAL: Record<string, number> = {
    // Fleisch & Fisch
    "hähnchenbrust": 110,
    "hähnchen": 110,
    "rinderfilet": 120,
    "hackfleisch": 250,
    "lachs": 200,
    "garnelen": 100,
    "thunfisch": 130,

    // Milchprodukte & Eier
    "ei": 155, // kcal pro 100g (ca. 2 Eier)
    "sahne": 300,
    "milch": 50,
    "kokosmilch": 200,
    "feta": 260,
    "parmesan": 400,
    "mozzarella": 280,
    "halloumi": 320,
    "creme fraiche": 300,
    "butter": 717,

    // Gemüse & Obst
    "avocado": 160,
    "kartoffel": 77,
    "tomate": 18,
    "zwiebel": 40,
    "knoblauch": 150,
    "brokkoli": 34,
    "blumenkohl": 25,
    "zucchini": 17,
    "paprika": 30,
    "aubergine": 25,
    "spinat": 23,
    "champignons": 22,
    "karotte": 41,
    "lauch": 30,
    "sellerie": 16,
    "kürbis": 26,
    "erdbeeren": 32,
    "banane": 89,
    "apfel": 52,
    "mango": 60,
    "mais": 85,
    "kidneybohnen": 115,
    "frühlingszwiebel": 30,

    // Kohlenhydrate
    "pasta": 350, // Rohgewicht
    "reis": 350,  // Rohgewicht
    "couscous": 350,
    "bulgur": 340,
    "quinoa": 360,
    "linden": 116, // gekocht
    "kichererbsen": 160,

    // Sonstiges
    "tofu": 80,
    "pesto": 400,
    "honig": 300,
    "zucker": 400,
    "mehl": 360,
    "öl": 900,
    "olivenöl": 900,
};

/**
 * Typical weights for non-standard units
 */
const UNIT_WEIGHTS: Record<string, number> = {
    "stk": 50, // Durchschnittliches Gewicht pro Stück (z.B. Ei, Zwiebel)
    "stk.": 50,
    "stück": 50,
    "dose": 400,
    "becher": 200,
    "el": 15,
    "tl": 5,
    "prise": 1,
    "zehe": 5,
    "bund": 50,
};

export function calculateTotalCalories(ingredients: { name: string, amount?: number | null | undefined, unit?: string | null | undefined }[]): number {
    let totalKcal = 0;

    for (const ing of ingredients) {
        const nameLower = ing.name.toLowerCase();

        // 1. Precise match (exact word)
        let ingredientKey = Object.keys(INGREDIENT_KCAL).find(key =>
            nameLower === key ||
            new RegExp(`\\b${key}\\b`, 'i').test(nameLower)
        );

        // 2. Fallback: Substring match (for things like "Hähnchenbrust" matching "Hähnchen")
        // We sort by length descending to match the most specific term first
        if (!ingredientKey) {
            ingredientKey = Object.keys(INGREDIENT_KCAL)
                .sort((a, b) => b.length - a.length)
                .find(key => nameLower.includes(key));
        }

        if (ingredientKey) {
            const kcalPer100 = INGREDIENT_KCAL[ingredientKey];
            const amount = ing.amount || 0;
            const unit = (ing.unit || "").toLowerCase();
            let kcal = 0;

            if (unit === "g" || unit === "ml") {
                kcal = (amount * kcalPer100) / 100;
            } else if (unit === "kg" || unit === "l") {
                kcal = (amount * 1000 * kcalPer100) / 100;
            } else if (UNIT_WEIGHTS[unit]) {
                const weightInG = amount * UNIT_WEIGHTS[unit];
                kcal = (weightInG * kcalPer100) / 100;
            } else {
                // Fallback: Wenn Einheit unbekannt, nehmen wir an 1 Einheit = 100g (sehr grobe Schätzung)
                kcal = amount * kcalPer100;
            }
            totalKcal += kcal;
        }
    }

    return Math.round(totalKcal);
}
