import { RecipeCard } from "../components/RecipeCard";
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CaretDown, ArrowRight } from "@phosphor-icons/react";
import Searchbar from "../components/ui/Searchbar";
import { Pill } from "../components/ui/Pill";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import FilterOverlay from "../components/FilterOverlay";
import TimeFilterOverlay from "../components/TimeFilterOverlay";
import IngredientFilterOverlay from "../components/IngredientFilterOverlay";

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
    const [activeFilter, setActiveFilter] = useState(null); // 'time' or 'ingredients'
    const [ingredientSearch, setIngredientSearch] = useState("");

    // Initialize state from URL if present
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
    const [selectedTime, setSelectedTime] = useState(searchParams.get("time") ? parseInt(searchParams.get("time")) : null);
    const [selectedIngredients, setSelectedIngredients] = useState(
        searchParams.get("ingredients") ? searchParams.get("ingredients").split(",") : []
    );

    const [recentSearches, setRecentSearches] = useState([
        { term: "Chili", count: 0 },
        { term: "Brokkoli Kartoffel", count: 0 },
        { term: "Avocado", count: 0 }
    ]);

    const searchInputRef = useRef(null);

    // Auto-focus the search input on mount
    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, []);

    const activeFilterCount = useMemo(() => {
        return (selectedTime ? 1 : 0) + selectedIngredients.length;
    }, [selectedTime, selectedIngredients]);

    const apiUrl = import.meta.env.VITE_API_URL;

    const handleSearch = (query) => {
        setSearchQuery(query);
        setActiveFilter(null);

        // Update URL and Navigate to results
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (selectedTime) params.set("time", selectedTime);
        if (selectedIngredients.length > 0) params.set("ingredients", selectedIngredients.join(","));

        // Update URL for the current page (keeping state in sync)
        setSearchParams(params);

        setRecentSearches(prev => {
            const exists = prev.find(s => s.term.toLowerCase() === query.toLowerCase());
            if (exists) return prev;
            return [{ term: query, count: 0 }, ...prev].slice(0, 5);
        });

        // Navigate to results page
        navigate(`/search/results?${params.toString()}`);
    };

    const handleCloseFilter = () => {
        setActiveFilter(null);
        setIngredientSearch("");
    };

    return (
        <div className="flex flex-col h-screen bg-white overflow-hidden">
            {/* Header / Searchbar */}
            <div className="px-4 py-4 border-b border-border-default/30">
                <Searchbar
                    ref={searchInputRef}
                    variant="default"
                    placeholder="Rezept suchen"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="focus-within:ring-2 focus-within:ring-brand-teal/10"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch(searchQuery);
                    }}
                />
            </div>

            {/* Filter Section */}
            <div className="flex gap-2 px-4 py-6">
                <Pill
                    icon={CaretDown}
                    className={cn(
                        "text-sm font-normal py-2.5",
                        selectedTime ? "bg-brand-teal text-white" : "bg-bg-light-gray"
                    )}
                    onClick={() => setActiveFilter('time')}
                >
                    Zubereitungszeit
                </Pill>
                <Pill
                    icon={CaretDown}
                    className={cn(
                        "text-sm font-normal py-2.5",
                        selectedIngredients.length > 0 ? "bg-brand-teal text-white" : "bg-bg-light-gray"
                    )}
                    onClick={() => setActiveFilter('ingredients')}
                >
                    Zutaten
                </Pill>
                <Pill
                    className="text-sm font-normal py-2.5 bg-bg-light-gray"
                >
                    Kalorien
                </Pill>
            </div>

            {/* Recent Searches (Always visible as per mockup) */}
            <div className="flex-1 px-4 overflow-y-auto no-scrollbar pt-2">
                <div className="flex flex-col gap-4">
                    <h3 className="text-base font-semibold text-text-default">Letzte Suchanfragen</h3>
                    <div className="flex flex-col rounded-2xl overflow-hidden shadow-sm">
                        {recentSearches.map((item, index) => (
                            <button
                                key={index}
                                className="flex justify-between items-center px-4 py-5 bg-bg-light-gray border-b border-white/50 last:border-none active:bg-border-default transition-colors text-left"
                                onClick={() => handleSearch(item.term)}
                            >
                                <span className="text-text-default font-normal text-base">{item.term}</span>
                                {activeFilterCount > 0 && (
                                    <span className="text-text-subinfo text-sm font-medium">+{activeFilterCount}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 pb-10 pt-4 bg-white flex flex-col items-center gap-6 border-t border-border-default/20">
                {activeFilterCount > 0 || searchQuery ? (
                    <button
                        className="text-red-500 font-semibold text-sm hover:underline"
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedTime(null);
                            setSelectedIngredients([]);
                        }}
                    >
                        Suche zurücksetzen
                    </button>
                ) : (
                    <div className="h-5" />
                )}

                <Button
                    className="w-full h-15 bg-brand-teal hover:bg-brand-teal/90 text-white rounded-[32px] font-semibold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                    onClick={() => handleSearch(searchQuery)}
                >
                    Alle Rezepte anzeigen
                    <ArrowRight size={20} weight="bold" />
                </Button>
            </div>

            {/* Filter Overlays */}
            <FilterOverlay
                isOpen={activeFilter === 'time'}
                onClose={handleCloseFilter}
                title="Zubereitungszeit"
            >
                <TimeFilterOverlay
                    selectedTime={selectedTime}
                    onSelect={(time) => {
                        setSelectedTime(time);
                        setActiveFilter(null);
                    }}
                />
            </FilterOverlay>

            <FilterOverlay
                isOpen={activeFilter === 'ingredients'}
                onClose={handleCloseFilter}
                showSearch
                searchValue={ingredientSearch}
                onSearchChange={setIngredientSearch}
            >
                <IngredientFilterOverlay
                    ingredients={SEARCHABLE_BASE_INGREDIENTS}
                    selectedIngredients={selectedIngredients}
                    searchQuery={ingredientSearch}
                    onReset={() => setSelectedIngredients([])}
                    onToggle={(ing) => {
                        setSelectedIngredients(prev =>
                            prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
                        );
                    }}
                />
            </FilterOverlay>
        </div>
    );
}
