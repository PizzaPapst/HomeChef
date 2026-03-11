import React, { useMemo } from 'react';
import { Pill } from "./ui/Pill";
import { cn } from "@/lib/utils";

const IngredientFilterOverlay = ({ ingredients, selectedIngredients, onToggle, searchQuery, onReset }) => {
    const filteredAndSortedIngredients = useMemo(() => {
        if (!ingredients) return [];
        // ... (rest of filtering logic)
        let list = ingredients.filter(ing =>
            ing.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const active = list.filter(ing => selectedIngredients.includes(ing)).sort();
        const inactive = list.filter(ing => !selectedIngredients.includes(ing)).sort();

        return [...active, ...inactive];
    }, [ingredients, selectedIngredients, searchQuery]);

    return (
        <div className="flex flex-col gap-6">
            {selectedIngredients.length > 0 && (
                <button
                    onClick={onReset}
                    className="text-brand-teal font-semibold text-sm self-start hover:underline"
                >
                    Auswahl zurücksetzen ({selectedIngredients.length})
                </button>
            )}
            <div className="flex flex-wrap gap-3">
                {filteredAndSortedIngredients.map((ingredient) => (
                    <Pill
                        key={ingredient}
                        variant="rounded"
                        icon={false}
                        active={selectedIngredients.includes(ingredient)}
                        onClick={() => onToggle(ingredient)}
                    >
                        {ingredient}
                    </Pill>
                ))}
                {filteredAndSortedIngredients.length === 0 && (
                    <p className="text-text-subinfo italic py-10 w-full text-center">Keine Zutaten gefunden.</p>
                )}
            </div>
        </div>
    );
};

export default IngredientFilterOverlay;
