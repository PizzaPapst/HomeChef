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
    <div className="flex flex-col gap-8 h-full bg-white px-4 pt-4 pb-24 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start flex-shrink-0">
        <Searchbar variant="button" />
      </div>

      {/* Scrollable Content */}
      <div className="flex flex-col gap-8 flex-1 overflow-y-auto no-scrollbar">
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
            onShowAll={() => navigate("/recipes/category/quick")}
          />
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {recipes.length > 0 ? (
              recipes
                .filter(recipe => recipe.categories?.some(c => c.name === "Schnell"))
                .slice(0, 5)
                .map(recipe => (
                  <RecipeCard
                    key={`small-${recipe.id}`}
                    variant="small"
                    recipe={recipe}
                  />
                ))
            ) : (
              [1, 2, 3].map(i => (
                <div key={i} className="w-[160px] h-[180px] bg-bg-light-gray rounded-[12px] animate-pulse flex-shrink-0" />
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
