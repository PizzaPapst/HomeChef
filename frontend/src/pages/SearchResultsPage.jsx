import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";
import { RecipeCard } from "../components/RecipeCard";
import Searchbar from "../components/ui/Searchbar";

export default function SearchResultsPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    const searchQuery = searchParams.get("q") || "";
    const selectedTime = searchParams.get("time") ? parseInt(searchParams.get("time")) : null;
    const selectedIngredients = searchParams.get("ingredients") ? searchParams.get("ingredients").split(",") : [];

    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (!apiUrl) return;
        setLoading(true);
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
            return matchesSearch && matchesTime && matchesIngredients;
        });
    }, [recipes, searchQuery, selectedTime, selectedIngredients]);

    const activeFilterCount = useMemo(() => {
        return (selectedTime ? 1 : 0) + selectedIngredients.length;
    }, [selectedTime, selectedIngredients]);

    const handleReEnterSearch = () => {
        // Navigate to search with current params
        // We also pass a flag or the search page knows it's coming from results
        navigate(`/search?${searchParams.toString()}&from_results=true`);
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <div className="p-4 flex items-center gap-3 border-b border-border-default">
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

            {/* Results */}
            <div className="flex-1 px-4 pt-6 overflow-y-auto no-scrollbar">
                <div className="flex flex-col gap-4 pb-10">
                    <h2 className="font-semibold text-lg text-text-default">
                        {loading ? "Rezepte werden geladen..." : `${filteredRecipes.length} Rezepte gefunden`}
                    </h2>

                    {!loading && filteredRecipes.length > 0 ? (
                        filteredRecipes.map((recipe) => (
                            <RecipeCard key={recipe.id} recipe={recipe} variant="list" />
                        ))
                    ) : !loading && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <p className="text-text-subinfo italic">Keine Rezepte gefunden.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
