import { RecipeCard, RecipeSectionHeader } from "../components/RecipeCard";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import Searchbar from "../components/ui/Searchbar";
import Header from "../components/ui/Header";
import { fetchAllRecipes } from "@/services/api";
import allFoodImg from "../assets/all_food.jpg";

export default function Cookbook() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  useEffect(() => {
    fetchAllRecipes().then(data => setRecipes(data));
  }, []);

  return (
    <div className="flex flex-col h-full bg-bg-alternation pb-24 overflow-hidden">
      {/* Header */}
      <Header>
        <h1 className="text-xl text-text-primary">Kochbuch</h1>
      </Header>

      {/* Scrollable Content */}
      <div className="flex flex-col gap-8 flex-1 overflow-y-auto no-scrollbar p-4 overscroll-contain">
        <Searchbar variant="button" placeholder="Rezept suchen" />
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
            onShowAll={() => navigate("/category/schnelle-rezepte")}
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
            onShowAll={() => navigate("/category/kalorienarm")}
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

        <Link
          to="/category/all"
          className="flex flex-col flex-shrink-0 w-full h-[180px] rounded-[16px] overflow-hidden group shadow-card-shadow bg-brand-teal"
        >
          <img
            src={allFoodImg}
            alt="Alle Rezepte"
            className="w-full h-0 flex-1 object-cover rounded-b-2xl"
          />

          {/* Content Container */}
          <div className="flex flex-row justify-between items-center text-text-inverted p-4">
            <h3 className="text-xl font-semibold ">Alle Rezepte</h3>
            <ArrowRight size={24} weight="bold" />
          </div>
        </Link>
      </div>

      {/* Floating Action Button */}
      <Button
        variant="fab"
        size="icon"
        className="fixed bottom-24 right-4 h-16 w-16 rounded-full z-50 text-text-inverted bg-brand-teal border-none shadow-fab-shadow"
        onClick={() => navigate("/recipe/create")}
      >
        <Plus size={24} weight="bold" />
      </Button>
    </div>
  );
}
