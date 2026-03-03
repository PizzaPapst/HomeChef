import { INGREDIENT_BLACKLIST } from './ingredient-config';

export function normalizeIngredientName(name: string): string {
    if (!name) return "";

    const lowerName = name.toLowerCase().trim();
    if (INGREDIENT_BLACKLIST.some(b => lowerName.includes(b.toLowerCase()))) {
        return "";
    }

    let normalized = lowerName;

    // 1. Remove common descriptors and suffixes
    normalized = normalized.replace(/\(.*\)/g, ""); // Remove (Size M) etc.
    normalized = normalized.replace(/zehe[n]?/g, ""); // "Knoblauchzehe" -> "Knoblauch "
    normalized = normalized.replace(/stange[n]?/g, ""); // "Lauchstange" -> "Lauch"

    // 2. Map synonyms/specifics to base
    const mappings: Record<string, string> = {
        "knoblauchzehe": "knoblauch",
        "knoblauchzehen": "knoblauch",
        "eier": "ei",
        "tomaten": "tomate",
        "zwiebeln": "zwiebel",
        "kartoffeln": "kartoffel",
        "möhren": "möhre",
        "karotten": "möhre",
        "basilikumblätter": "basilikum",
    };

    if (mappings[normalized]) {
        normalized = mappings[normalized];
    }

    // 3. Very simple plural stripping (s/n/en) - improved over time
    if (normalized.endsWith("en") && normalized.length > 4) {
        normalized = normalized.slice(0, -2);
    } else if (normalized.endsWith("n") && normalized.length > 4) {
        normalized = normalized.slice(0, -1);
    }

    // 4. Final cleanup
    return normalized.trim();
}
