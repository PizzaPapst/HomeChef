import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CaretLeft } from "@phosphor-icons/react";
import { RecipeCard } from "../components/RecipeCard";
import { IconButton } from "../components/ui/IconButton";

const CATEGORY_MAP = {
    quick: "Schnelle Rezepte",
    vegetarian: "Vegetarisch",
    "low-calorie": "Kalorienarm",
    "high-protein": "High Protein",
};

export default function CategoryView() {
    const { category } = useParams();
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const apiUrl = import.meta.env.VITE_API_URL;

    const categoryTitle = CATEGORY_MAP[category] || category;

    useEffect(() => {
        if (!apiUrl || !category) return;

        setLoading(true);
        fetch(`${apiUrl}/recipes?category=${category}`)
            .then((res) => res.json())
            .then((data) => {
                setRecipes(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error loading category recipes:", err);
                setLoading(false);
            });
    }, [apiUrl, category]);

    return (
        <div className="flex flex-col gap-6 h-full bg-white px-4 pt-4 pb-[100px] overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="flex items-center gap-4">
                <IconButton variant="standalone" onClick={() => navigate(-1)}>
                    <CaretLeft size={24} weight="bold" />
                </IconButton>
                <h1 className="text-2xl font-bold font-['Poppins'] text-text-default">
                    {categoryTitle}
                </h1>
            </div>

            {/* Recipe List */}
            <div className="flex flex-col gap-4">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal"></div>
                    </div>
                ) : recipes.length > 0 ? (
                    recipes.map((recipe) => (
                        <RecipeCard
                            key={`cat-list-${recipe.id}`}
                            variant="list"
                            recipe={recipe}
                        />
                    ))
                ) : (
                    <div className="text-center py-20 text-text-label font-['Poppins']">
                        Keine Rezepte in dieser Kategorie gefunden.
                    </div>
                )}
            </div>
        </div>
    );
}
