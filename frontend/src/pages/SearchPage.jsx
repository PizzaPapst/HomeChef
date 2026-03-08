import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import Searchbar from "../components/ui/Searchbar";
import { Pill } from "../components/ui/Pill";
import { Button } from "../components/ui/button";
import FilterOverlay from "../components/FilterOverlay";
import TimeFilterOverlay from "../components/TimeFilterOverlay";
import IngredientFilterOverlay from "../components/IngredientFilterOverlay";
import { fetchRecentSearches, saveSearchHistory, deleteSearchHistory } from "../services/api";

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

    const [activeFilter, setActiveFilter] = useState(null); // 'time' or 'ingredients'
    const [ingredientSearch, setIngredientSearch] = useState("");

    // Initialize state from URL if present
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
    const [selectedTime, setSelectedTime] = useState(searchParams.get("time") ? parseInt(searchParams.get("time")) : null);
    const [selectedIngredients, setSelectedIngredients] = useState(
        searchParams.get("ingredients") ? searchParams.get("ingredients").split(",") : []
    );

    const [recentSearches, setRecentSearches] = useState([]);

    useEffect(() => {
        const loadHistory = async () => {
            let history = await fetchRecentSearches();

            // Check if we arrived from results and need to "activate" and "delete" the current search from history
            if (searchParams.get("from_results") === "true") {
                const term = searchParams.get("q") || "";
                const time = searchParams.get("time") ? parseInt(searchParams.get("time")) : null;
                const ingredients = searchParams.get("ingredients") ? searchParams.get("ingredients").split(",") : [];
                const filters = { time, ingredients };
                const filterCount = (time ? 1 : 0) + ingredients.length;

                // Use the top-level import
                await deleteSearchHistory(term, filterCount, filters);

                // Refresh history after deletion
                history = await fetchRecentSearches();

                // Remove the flag from URL without reloading
                const newParams = new URLSearchParams(searchParams);
                newParams.delete("from_results");
                setSearchParams(newParams, { replace: true });
            }

            setRecentSearches(history);
        };
        loadHistory();
    }, [searchParams, setSearchParams]);

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

    const handleSearch = (query, filters = null) => {
        let currentQuery = query;
        let currentTime = selectedTime;
        let currentIngredients = selectedIngredients;
        let currentFilterCount = activeFilterCount;

        if (filters) {
            currentTime = filters.time;
            currentIngredients = filters.ingredients || [];
            currentFilterCount = (currentTime ? 1 : 0) + currentIngredients.length;

            // Re-sync local state if we want the UI to reflect these (e.g. pills)
            setSelectedTime(currentTime);
            setSelectedIngredients(currentIngredients);
        }

        setSearchQuery(currentQuery);
        setActiveFilter(null);

        // Update URL and Navigate to results
        const params = new URLSearchParams();
        if (currentQuery) params.set("q", currentQuery);
        if (currentTime) params.set("time", currentTime);
        if (currentIngredients.length > 0) params.set("ingredients", currentIngredients.join(","));

        // Update URL for the current page (keeping state in sync)
        setSearchParams(params);

        // Save to backend history (only if it's a new or modified search, not just re-clicking)
        // Actually, we can just always save it, the backend handles the limit.
        const saveFilters = {
            time: currentTime,
            ingredients: currentIngredients
        };
        saveSearchHistory(currentQuery, currentFilterCount, saveFilters).then(() => {
            fetchRecentSearches().then(setRecentSearches);
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
            <div className="p-4 border-b border-border-default">
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

            {/* Body / Filter Section */}
            <div className="flex flex-col gap-8 p-4 flex-1 overflow-y-auto no-scrollbar">
                <div className="flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                    <Pill onClick={() => setActiveFilter('time')}>
                        Zubereitungszeit
                    </Pill>
                    <Pill onClick={() => setActiveFilter('ingredients')}>
                        Zutaten
                    </Pill>
                    <Pill>Kalorien</Pill>
                </div>

                <div className="">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium text-text-default">Letzte Suchanfragen</h3>
                        <div className="flex flex-col rounded-sm overflow-hidden">
                            {recentSearches.map((item, index) => (
                                <button
                                    key={index}
                                    className="flex justify-between items-center px-3 bg-bg-light-gray min-h-12"
                                    onClick={() => handleSearch(item.term, item.filters)}
                                >
                                    <span className={`text-sm ${item.term ? 'text-text-default' : 'text-text-subinfo'}`}>{item.term || "Leere Suche"}</span>
                                    {item.filterCount > 0 && (
                                        <span className="text-text-subinfo text-sm font-medium">+{item.filterCount}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white flex flex-col items-center gap-4 border-t border-border-default">
                {activeFilterCount > 0 || searchQuery ? (
                    <button
                        className="text-red-500 font-base hover:underline"
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
                    className="w-full bg-brand-teal"
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
