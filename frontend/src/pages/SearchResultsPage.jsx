import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";
import { RecipeCard } from "../components/RecipeCard";
import Searchbar from "../components/ui/Searchbar";

const CATEGORY_MAP = {
    vegetarian: "Vegetarisch",
    "high-protein": "High Protein",
};

export default function SearchResultsPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    const searchQuery = searchParams.get("q") || "";
    const selectedTime = searchParams.get("time") ? parseInt(searchParams.get("time")) : null;
    const selectedIngredients = searchParams.get("ingredients") ? searchParams.get("ingredients").split(",") : [];
    const selectedCategory = searchParams.get("category") || null;
    const selectedCalories = searchParams.get("calories") ? parseInt(searchParams.get("calories")) : null;

    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (!apiUrl) return;
        setLoading(true);
        // We fetch all recipes for now as client-side filtering is implemented
        // In a real app with many recipes, we'd fetch with filters
        fetch(`${apiUrl}/recipes`)
            .then(res => res.json())
            .then(data => {
                setRecipes(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error loading recipes:', err);
                setLoading(false);
            });
    }, [apiUrl]);

    const filteredRecipes = useMemo(() => {
        return recipes.filter(r => {
            const matchesSearch = !searchQuery || (r.title && r.title.toLowerCase().includes(searchQuery.toLowerCase()));
            const prepTimeValue = r.prepTime ? parseInt(r.prepTime) : 0;
            const matchesTime = !selectedTime || (
                selectedTime <= 45
                    ? (prepTimeValue > 0 && prepTimeValue <= selectedTime)
                    : (prepTimeValue > 45)
            );
            const matchesIngredients = selectedIngredients.length === 0 || (
                selectedIngredients.every(selected =>
                    r.ingredients?.some(i => {
                        const name = i.name.toLowerCase();
                        const normalized = i.normalizedName?.toLowerCase() || "";
                        const search = selected.toLowerCase();
                        return name.includes(search) || normalized.includes(search);
                    })
                )
            );

            const matchesCategory = !selectedCategory || (
                r.categories?.some(c => {
                    const mappedName = CATEGORY_MAP[selectedCategory];
                    return c.name === mappedName || c.name.toLowerCase() === selectedCategory.toLowerCase();
                })
            );

            const recipeCalories = r.calories || 0;
            const matchesCalories = !selectedCalories || (
                selectedCalories <= 800
                    ? (recipeCalories > 0 && recipeCalories <= selectedCalories)
                    : (recipeCalories > 800)
            );

            return matchesSearch && matchesTime && matchesIngredients && matchesCategory && matchesCalories;
        });
    }, [recipes, searchQuery, selectedTime, selectedIngredients, selectedCategory, selectedCalories]);

    const activeFilterCount = useMemo(() => {
        return (selectedTime ? 1 : 0) + selectedIngredients.length + (selectedCategory ? 1 : 0) + (selectedCalories ? 1 : 0);
    }, [selectedTime, selectedIngredients, selectedCategory, selectedCalories]);

    const handleReEnterSearch = () => {
        navigate(`/search?${searchParams.toString()}&from_results=true`);
    };

    const resultTitle = useMemo(() => {
        if (loading) return "Rezepte werden geladen...";
        const count = filteredRecipes.length;
        return `${count} ${count === 1 ? 'Rezept' : 'Rezepte'} gefunden`;
    }, [loading, filteredRecipes.length]);

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <div className="flex flex-col border-b border-border-default">
                <div className="p-4 flex items-center gap-3">
                    <button
                        onClick={() => navigate("/")}
                        className="p-2 -ml-2 rounded-full hover:bg-bg-light-gray transition-colors shrink-0"
                    >
                        <ArrowLeft size={24} weight="bold" className="text-text-default" />
                    </button>
                    <Searchbar
                        variant="button"
                        value={searchQuery}
                        filterCount={activeFilterCount}
                        readOnly
                        onClick={handleReEnterSearch}
                        className="flex-1"
                    />
                </div>
            </div>

            {/* Results */}
            <div className="flex-1 px-4 pt-6 overflow-y-auto no-scrollbar">
                <div className="flex flex-col gap-4 pb-10">
                    <h2 className="font-semibold text-lg text-text-default">
                        {resultTitle}
                    </h2>

                    {!loading && filteredRecipes.length > 0 ? (
                        filteredRecipes.map((recipe) => (
                            <RecipeCard
                                key={recipe.id}
                                // Hide category tags as requested
                                recipe={{ ...recipe, categories: [] }}
                                variant="list"
                            />
                        ))
                    ) : !loading && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <p className="text-text-subinfo italic">Keine Rezepte gefunden.</p>
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={() => navigate("/search/results")}
                                    className="mt-4 text-brand-teal font-medium"
                                >
                                    Alle Filter zurücksetzen
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
