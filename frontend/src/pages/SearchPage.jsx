import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import Searchbar from "../components/ui/Searchbar";
import { Pill } from "../components/ui/Pill";
import { Button } from "../components/ui/button";
import FilterOverlay from "../components/FilterOverlay";
import TimeFilterOverlay from "../components/TimeFilterOverlay";
import IngredientFilterOverlay from "../components/IngredientFilterOverlay";
import CalorieFilterOverlay from "../components/CalorieFilterOverlay";
import CategoryFilterOverlay from "../components/CategoryFilterOverlay";
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

    const [activeFilter, setActiveFilter] = useState(null); // 'time', 'ingredients', 'calories', 'categories'
    const [ingredientSearch, setIngredientSearch] = useState("");

    // Initialize state from URL if present
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
    const [selectedTime, setSelectedTime] = useState(searchParams.get("time") ? parseInt(searchParams.get("time")) : null);
    const [selectedIngredients, setSelectedIngredients] = useState(
        searchParams.get("ingredients") ? searchParams.get("ingredients").split(",") : []
    );
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || null);
    const [selectedCalories, setSelectedCalories] = useState(searchParams.get("calories") ? parseInt(searchParams.get("calories")) : null);

    const [recentSearches, setRecentSearches] = useState([]);

    useEffect(() => {
        const loadHistory = async () => {
            let history = await fetchRecentSearches();

            // Check if we arrived from results and need to "activate" and "delete" the current search from history
            if (searchParams.get("from_results") === "true") {
                const term = searchParams.get("q") || "";
                const time = searchParams.get("time") ? parseInt(searchParams.get("time")) : null;
                const ingredients = searchParams.get("ingredients") ? searchParams.get("ingredients").split(",") : [];
                const category = searchParams.get("category") || null;
                const calories = searchParams.get("calories") ? parseInt(searchParams.get("calories")) : null;

                const filters = { time, ingredients, category, calories };
                const filterCount = (time ? 1 : 0) + ingredients.length + (category ? 1 : 0) + (calories ? 1 : 0);

                await deleteSearchHistory(term, filterCount, filters);
                history = await fetchRecentSearches();

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
        return (selectedTime ? 1 : 0) + selectedIngredients.length + (selectedCategory ? 1 : 0) + (selectedCalories ? 1 : 0);
    }, [selectedTime, selectedIngredients, selectedCategory, selectedCalories]);

    const handleSearch = (query, filters = null) => {
        let currentQuery = query;
        let currentTime = selectedTime;
        let currentIngredients = selectedIngredients;
        let currentCategory = selectedCategory;
        let currentCalories = selectedCalories;

        if (filters) {
            currentTime = filters.time;
            currentIngredients = filters.ingredients || [];
            currentCategory = filters.category || null;
            currentCalories = filters.calories || null;

            setSelectedTime(currentTime);
            setSelectedIngredients(currentIngredients);
            setSelectedCategory(currentCategory);
            setSelectedCalories(currentCalories);
        }

        const currentFilterCount = (currentTime ? 1 : 0) + currentIngredients.length + (currentCategory ? 1 : 0) + (currentCalories ? 1 : 0);

        setSearchQuery(currentQuery);
        setActiveFilter(null);

        const params = new URLSearchParams();
        if (currentQuery) params.set("q", currentQuery);
        if (currentTime) params.set("time", currentTime);
        if (currentIngredients.length > 0) params.set("ingredients", currentIngredients.join(","));
        if (currentCategory) params.set("category", currentCategory);
        if (currentCalories) params.set("calories", currentCalories);

        setSearchParams(params);

        const saveFilters = {
            time: currentTime,
            ingredients: currentIngredients,
            category: currentCategory,
            calories: currentCalories
        };
        saveSearchHistory(currentQuery, currentFilterCount, saveFilters).then(() => {
            fetchRecentSearches().then(setRecentSearches);
        });

        navigate(`/search/results?${params.toString()}`);
    };

    const handleCloseFilter = () => {
        setActiveFilter(null);
        setIngredientSearch("");
    };

    const getFilterLabel = (type) => {
        switch (type) {
            case 'time':
                if (!selectedTime) return "Zubereitungszeit";
                return selectedTime <= 45 ? `Bis ${selectedTime} min` : "Über 45 min";
            case 'ingredients':
                if (selectedIngredients.length === 0) return "Zutaten";
                if (selectedIngredients.length <= 2) return selectedIngredients.join(", ");
                return `${selectedIngredients.length} Zutaten`;
            case 'calories':
                if (!selectedCalories) return "Kalorien";
                return selectedCalories <= 800 ? `Bis ${selectedCalories} kcal` : "Über 800 kcal";
            case 'categories':
                if (!selectedCategory) return "Kategorien";
                const categoryLabels = {
                    vegetarian: "Vegetarisch",
                    "high-protein": "High Protein"
                };
                return categoryLabels[selectedCategory] || selectedCategory;
            default:
                return "";
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white overflow-hidden">
            {/* Header / Searchbar */}
            <div className="p-4 border-b border-border-default bg-white">
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
            <div className="flex flex-col gap-8 p-4 flex-1 overflow-y-auto no-scrollbar bg-bg-alternation">
                <div className="flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                    <Pill onClick={() => setActiveFilter('time')} active={!!selectedTime}>
                        {getFilterLabel('time')}
                    </Pill>
                    <Pill onClick={() => setActiveFilter('ingredients')} active={selectedIngredients.length > 0}>
                        {getFilterLabel('ingredients')}
                    </Pill>
                    <Pill onClick={() => setActiveFilter('calories')} active={!!selectedCalories}>
                        {getFilterLabel('calories')}
                    </Pill>
                    <Pill onClick={() => setActiveFilter('categories')} active={!!selectedCategory}>
                        {getFilterLabel('categories')}
                    </Pill>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3">
                        <h3 className="text-sm font-medium text-text-default font-['Poppins']">Letzte Suchanfragen</h3>
                        <div className="flex flex-col rounded-sm overflow-hidden">
                            {recentSearches.map((item, index) => (
                                <button
                                    key={index}
                                    className="flex justify-between items-center px-3 bg-bg-light-gray min-h-12 border-b border-white last:border-b-0"
                                    onClick={() => handleSearch(item.term, item.filters)}
                                >
                                    <span className={`text-sm ${item.term ? 'text-text-default' : 'text-text-subinfo'}`}>{item.term || "Leere Suche"}</span>
                                    {item.filterCount > 0 && (
                                        <span className="text-text-subinfo text-sm font-medium">+{item.filterCount}</span>
                                    )}
                                </button>
                            ))}
                            {recentSearches.length === 0 && (
                                <p className="text-sm text-text-subinfo italic py-2">Keine Suchhistorie vorhanden.</p>
                            )}
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
                            setSelectedCategory(null);
                            setSelectedCalories(null);
                        }}
                    >
                        Suche zurücksetzen
                    </button>
                ) : (
                    <div className="h-5" />
                )}

                <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => handleSearch(searchQuery)}
                >
                    Rezepte anzeigen
                    <ArrowRight size={16} weight="bold" />
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

            <FilterOverlay
                isOpen={activeFilter === 'calories'}
                onClose={handleCloseFilter}
                title="Kalorien"
            >
                <CalorieFilterOverlay
                    selectedCalories={selectedCalories}
                    onSelect={(cal) => {
                        setSelectedCalories(cal);
                        setActiveFilter(null);
                    }}
                />
            </FilterOverlay>

            <FilterOverlay
                isOpen={activeFilter === 'categories'}
                onClose={handleCloseFilter}
                title="Kategorien"
            >
                <CategoryFilterOverlay
                    selectedCategory={selectedCategory}
                    onSelect={(cat) => {
                        setSelectedCategory(cat);
                        setActiveFilter(null);
                    }}
                />
            </FilterOverlay>
        </div>
    );
}
