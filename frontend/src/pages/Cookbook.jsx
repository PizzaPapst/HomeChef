import { RecipeCard, RecipeSectionHeader } from "../components/RecipeCard";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import Searchbar from "../components/ui/Searchbar";

export default function Cookbook() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!apiUrl) return;
    fetch(`${apiUrl}/recipes`)
      .then(res => res.json())
      .then(data => setRecipes(data))
      .catch(err => console.error('Error loading recipes:', err));
  }, [apiUrl]);

  return (
    <div className="flex flex-col h-full bg-bg-alternation pb-24 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start flex-shrink-0 bg-white p-4">
        <Searchbar variant="button" placeholder="Rezept suchen" />
      </div>

      {/* Scrollable Content */}
      <div className="flex flex-col gap-8 flex-1 overflow-y-auto no-scrollbar p-4 ">
        {/* Featured Section */}
        <section className="flex-shrink-0 flex flex-col gap-0">
          <RecipeSectionHeader title="Vorschlag des Tages" showAll={false} />
          {recipes.length > 0 ? (
            <RecipeCard
              variant="large"
              recipe={recipes[0]}
              isFavorite={true}
            />
          ) : (
            <div className="h-[240px] w-full bg-bg-light-gray rounded-[16px] animate-pulse" />
          )}
        </section>
        <section className="relative flex-shrink-0">
          <RecipeSectionHeader
            title="Schnelle Rezepte"
            onShowAll={() => navigate("/search/results?time=30")}
          />
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {recipes.length > 0 ? (
              recipes
                .filter(recipe => recipe.prepTime && recipe.prepTime <= 30)
                .slice(0, 5)
                .map(recipe => (
                  <RecipeCard
                    key={`small-quick-${recipe.id}`}
                    variant="small"
                    recipe={recipe}
                  />
                ))
            ) : (
              [1, 2, 3].map(i => (
                <div key={`skeleton-quick-${i}`} className="w-[160px] h-[180px] bg-bg-light-gray rounded-[12px] animate-pulse flex-shrink-0" />
              ))
            )}
          </div>
        </section>

        <section className="relative flex-shrink-0">
          <RecipeSectionHeader
            title="Kalorienarm"
            onShowAll={() => navigate("/search/results?calories=600")}
          />
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {recipes.length > 0 ? (
              recipes
                .filter(recipe => recipe.calories && recipe.calories <= 600)
                .slice(0, 5)
                .map(recipe => (
                  <RecipeCard
                    key={`small-calories-${recipe.id}`}
                    variant="small"
                    recipe={recipe}
                  />
                ))
            ) : (
              [1, 2, 3].map(i => (
                <div key={`skeleton-calories-${i}`} className="w-[160px] h-[180px] bg-bg-light-gray rounded-[12px] animate-pulse flex-shrink-0" />
              ))
            )}
          </div>
        </section>
      </div>

      {/* Floating Action Button */}
      <Button
        variant="fab"
        size="icon"
        className="fixed bottom-24 right-4 h-16 w-16 rounded-full z-50 text-text-inverted bg-brand-orange border-none shadow-fab-shadow"
        onClick={() => navigate("/recipe/create")}
      >
        <Plus size={24} weight="bold" />
      </Button>
    </div>
  );
}
