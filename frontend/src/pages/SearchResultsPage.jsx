import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";
import { RecipeCard } from "../components/RecipeCard";
import Searchbar from "../components/ui/Searchbar";
import Header from "../components/ui/Header";
import { IconButton } from "../components/ui/IconButton";
import { fetchAllRecipes } from "@/services/api";

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

    useEffect(() => {
        setLoading(true);
        fetchAllRecipes().then(data => {
            setRecipes(data);
            setLoading(false);
        }).catch(err => {
            console.error('Error loading recipes:', err);
            setLoading(false);
        });
    }, []);

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
        <div className="flex flex-col h-screen bg-bg-alternation">
            {/* Header */}
            <Header className="px-0">
                <div className="flex items-center">
                    <IconButton variant="ghost" onClick={() => navigate("/")}>
                        <ArrowLeft size={20} weight="bold" />
                    </IconButton>
                    <h1 className="text-xl text-text-primary">Suchergebnisse</h1>
                </div>
            </Header>

            {/* Results */}


            <div className="flex-1 p-4 overflow-y-auto no-scrollbar overscroll-contain">
                <div className="flex flex-col gap-4">

                    <Searchbar
                        variant="button"
                        value={searchQuery}
                        filterCount={activeFilterCount}
                        readOnly
                        onClick={handleReEnterSearch}
                        className="flex-1"
                    />

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
