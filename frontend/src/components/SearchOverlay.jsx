import React, { useState, useEffect } from 'react';
import { ArrowLeft, MagnifyingGlass, CaretDown, X } from "@phosphor-icons/react";
import { CardIconButton } from "./ui/CardIconButton";
import { Pill } from "./ui/Pill";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import FilterOverlay from "./FilterOverlay";
import TimeFilterOverlay from "./TimeFilterOverlay";
import IngredientFilterOverlay from "./IngredientFilterOverlay";

const SearchOverlay = ({
    isOpen,
    onClose,
    onSearch,
    recentSearches = [],
    initialQuery = "",
    selectedTime,
    setSelectedTime,
    selectedIngredients,
    setSelectedIngredients,
    availableIngredients = []
}) => {
    const [query, setQuery] = useState(initialQuery);
    const [activeFilter, setActiveFilter] = useState(null); // 'time' or 'ingredients'
    const [ingredientSearch, setIngredientSearch] = useState("");

    useEffect(() => {
        if (isOpen) setQuery(initialQuery);
    }, [isOpen, initialQuery]);

    if (!isOpen) return null;

    const isSearchable = query.trim().length > 0 || selectedTime !== null || selectedIngredients.length > 0;

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && isSearchable) {
            onSearch(query);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] bg-custom-bg flex flex-col pt-6">
                {/* ... (Header and Content Area) */}
                <div className="flex items-center gap-4 mb-8 px-4">
                    <CardIconButton onClick={onClose} className="shrink-0">
                        <X size={20} weight="bold" />
                    </CardIconButton>
                    <div className="relative flex-1">
                        <input
                            type="text"
                            className="w-full h-14 bg-white border border-border rounded-xl px-4 text-text-default placeholder:text-text-subinfo focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
                            placeholder="Rezepte durchsuchen"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto pb-4">
                    {/* Filter Pills - Horizontal Scroll with edge-to-edge feeling */}
                    <div className="flex gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide px-4">
                        <Pill
                            icon={CaretDown}
                            onClick={() => setActiveFilter('time')}
                            className={cn("shrink-0", selectedTime ? "bg-brand-teal text-white" : "")}
                        >
                            {selectedTime ? `Zubereitungszeit: ${selectedTime <= 45 ? `Bis ${selectedTime} min` : "Über 45 min"}` : "Zubereitungszeit"}
                        </Pill>
                        <Pill
                            icon={CaretDown}
                            onClick={() => setActiveFilter('ingredients')}
                            className={cn("shrink-0", selectedIngredients.length > 0 ? "bg-brand-teal text-white" : "")}
                        >
                            {selectedIngredients.length > 0 ? `Zutaten (${selectedIngredients.length})` : "Zutaten"}
                        </Pill>
                    </div>

                    {/* Recent Searches - Padded */}
                    <div className="flex flex-col gap-4 px-4">
                        <h3 className="font-semibold text-lg text-text-default">Letzte Suchanfragen</h3>
                        <div className="flex flex-col">
                            {recentSearches.length > 0 ? (
                                recentSearches.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center p-4 bg-alternative-bg first:rounded-t-xl last:rounded-b-xl border-b border-border-default last:border-none cursor-pointer hover:bg-teal-light transition-colors"
                                        onClick={() => {
                                            onSearch(item.term);
                                        }}
                                    >
                                        <span className="text-text-default font-medium">{item.term}</span>
                                        <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                            {item.count}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-text-subinfo italic">Noch keine Suchanfragen vorhanden.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer with Search Button - Padded & Sticky feeling */}
                <div className="px-4 pb-8 pt-4 bg-custom-bg border-t border-border/10">
                    <Button
                        className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white h-14 rounded-xl font-bold shadow-md flex items-center justify-center gap-2"
                        onClick={() => isSearchable && onSearch(query)}
                        disabled={!isSearchable}
                    >
                        <MagnifyingGlass size={20} weight="bold" />
                        Suche starten
                    </Button>
                </div>
            </div>

            {/* Advanced Filters */}
            <FilterOverlay
                isOpen={activeFilter === 'time'}
                onClose={() => setActiveFilter(null)}
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
                onClose={() => {
                    setActiveFilter(null);
                    setIngredientSearch("");
                }}
                showSearch
                searchValue={ingredientSearch}
                onSearchChange={setIngredientSearch}
            >
                <IngredientFilterOverlay
                    ingredients={availableIngredients}
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
        </>
    );
};

export default SearchOverlay;
