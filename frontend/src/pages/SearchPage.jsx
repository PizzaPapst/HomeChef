import { RecipeCard } from "../components/RecipeCard";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MagnifyingGlass, ArrowLeft, X } from "@phosphor-icons/react";
import { IconButton } from "@/components/ui/IconButton";
import SearchOverlay from "../components/SearchOverlay";

const SEARCHABLE_BASE_INGREDIENTS = [
    "Apfel", "Aubergine", "Avocado", "Banane", "Bärlauch", "Blumenkohl", "Brokkoli", "Bulgur",
    "Champignons", "Couscous", "Creme Fraiche", "Ei", "Erdbeeren", "Feta", "Fisch", "Frühlingszwiebel", "Garnelen", "Hackfleisch", "Halloumi",
    "Hähnchenbrust", "Honig", "Karotte", "Kartoffel", "Kichererbsen", "Kidneybohnen", "Knoblauch",
    "Kokosmilch", "Kürbis", "Lachs", "Lauch", "Linsen", "Mais", "Mango", "Milch", "Mozzarella", "Paprika",
    "Parmesan", "Passierte Tomaten", "Pasta", "Pesto", "Quinoa", "Reis", "Rinderfilet", "Sahne",
    "Salbei", "Sellerie", "Senf", "Spinat", "Thunfisch", "Tofu", "Tomate", "Zucchini", "Zwiebel"
].sort();

export default function SearchPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [recipes, setRecipes] = useState([])
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Initialize state from URL if present
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
    const [selectedTime, setSelectedTime] = useState(searchParams.get("time") ? parseInt(searchParams.get("time")) : null);
    const [selectedIngredients, setSelectedIngredients] = useState(
        searchParams.get("ingredients") ? searchParams.get("ingredients").split(",") : []
    );

    const [recentSearches, setRecentSearches] = useState([
        { term: "Chili con", count: 5 },
        { term: "Brokkoli Kartoffel", count: 1 },
        { term: "Avocado", count: 5 }
    ]);

    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (!apiUrl) return;

        fetch(`${apiUrl}/recipes`)
            .then(response => response.json())
            .then(data => setRecipes(data))
            .catch(error => console.error('Fehler beim Laden:', error));
    }, [apiUrl]);

    // If no search query, open the overlay immediately
    useEffect(() => {
        if (!searchQuery && !selectedTime && selectedIngredients.length === 0) {
            setIsSearchOpen(true);
        }
    }, [searchQuery, selectedTime, selectedIngredients]);

    const handleSearch = (query) => {
        setSearchQuery(query);
        setIsSearchOpen(false);

        // Update URL
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (selectedTime) params.set("time", selectedTime);
        if (selectedIngredients.length > 0) params.set("ingredients", selectedIngredients.join(","));
        setSearchParams(params);

        setRecentSearches(prev => {
            const exists = prev.find(s => s.term.toLowerCase() === query.toLowerCase());
            if (exists) return prev;
            return [{ term: query, count: Math.floor(Math.random() * 10) + 1 }, ...prev].slice(0, 5);
        });
    };

    const handleCloseSearch = () => {
        setIsSearchOpen(false);
        // If we're closing the search overlay and there's no query, go back to cookbook
        if (!searchQuery && !selectedTime && selectedIngredients.length === 0) {
            navigate("/");
        }
    };

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

    return (
        <div className="flex flex-1 flex-col gap-1 bg-custom-bg min-h-screen">
            <div className="bg-custom-bg flex flex-col flex-1 gap-8 px-4 pt-6">

                <div className="flex items-center gap-4">
                    <CardIconButton onClick={() => navigate("/")}>
                        <ArrowLeft size={20} weight="bold" />
                    </CardIconButton>

                    <div
                        className="flex-1 h-14 bg-white border border-border rounded-xl px-4 flex items-center justify-between cursor-pointer"
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <span className="text-text-default font-medium">{searchQuery || "Suche..."}</span>
                        {(selectedTime || selectedIngredients.length > 0) && (
                            <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                {(selectedTime ? 1 : 0) + selectedIngredients.length}
                            </div>
                        )}
                    </div>

                    <CardIconButton onClick={() => { setSearchQuery(""); setIsSearchOpen(true); }}>
                        <X size={20} weight="bold" />
                    </CardIconButton>
                </div>

                <div className="flex flex-col gap-4 pb-10">
                    <h2 className="font-semibold text-lg">
                        {filteredRecipes.length} Rezepte gefunden
                    </h2>
                    {filteredRecipes.length > 0 ? (
                        filteredRecipes.map((recipe) => (
                            <RecipeCard key={recipe.id} recipe={recipe} />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <p className="text-text-subinfo italic">Keine Rezepte gefunden.</p>
                        </div>
                    )}
                </div>
            </div>

            <SearchOverlay
                isOpen={isSearchOpen}
                onClose={handleCloseSearch}
                onSearch={handleSearch}
                recentSearches={recentSearches}
                initialQuery={searchQuery}
                selectedTime={selectedTime}
                setSelectedTime={(time) => {
                    setSelectedTime(time);
                    // Dynamic update URL if search is active
                    if (searchQuery) {
                        const params = new URLSearchParams(searchParams);
                        if (time) params.set("time", time); else params.delete("time");
                        setSearchParams(params);
                    }
                }}
                selectedIngredients={selectedIngredients}
                setSelectedIngredients={(ing) => {
                    setSelectedIngredients(ing);
                    if (searchQuery) {
                        const params = new URLSearchParams(searchParams);
                        if (ing.length > 0) params.set("ingredients", ing.join(",")); else params.delete("ingredients");
                        setSearchParams(params);
                    }
                }}
                availableIngredients={SEARCHABLE_BASE_INGREDIENTS}
            />
        </div>
    )
}
