import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";
import { RecipeCard } from "../components/RecipeCard";
import Header from "../components/ui/Header";
import { IconButton } from "../components/ui/IconButton";
import { fetchAllRecipes } from "@/services/api";

const CATEGORY_CONFIG = {
    "schnelle-rezepte": {
        title: "Schnelle Rezepte",
        filterFunc: (recipe) => recipe.prepTime && recipe.prepTime <= 30
    },
    "kalorienarm": {
        title: "Kalorienarm",
        filterFunc: (recipe) => recipe.calories && recipe.calories <= 600
    },
    "all": {
        title: "Alle Rezepte",
        filterFunc: () => true
    }
};

export default function CategoryPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    const config = CATEGORY_CONFIG[id] || {
        title: "Kategorie",
        filterFunc: () => true
    };

    useEffect(() => {
        setLoading(true);
        fetchAllRecipes().then(data => {
            setRecipes(data);
            setLoading(false);
        }).catch(err => {
            console.error('Error loading recipes:', err);
            setLoading(false);
        });
    }, [id]);

    const filteredRecipes = useMemo(() => {
        return recipes.filter(config.filterFunc);
    }, [recipes, config]);

    return (
        <div className="flex flex-col h-screen bg-bg-alternation">
            {/* Header */}
            <Header className="px-0">
                <div className="flex items-center">
                    <IconButton variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} weight="bold" />
                    </IconButton>
                    <h1 className="text-xl text-text-primary">{config.title}</h1>
                </div>
            </Header>

            {/* Results */}
            <div className="flex-1 p-4 overflow-y-auto no-scrollbar overscroll-contain">
                <div className="flex flex-col gap-4">
                    {!loading && filteredRecipes.length > 0 ? (
                        filteredRecipes.map((recipe) => (
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                variant="list"
                            />
                        ))
                    ) : !loading && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <p className="text-text-subinfo italic">Keine Rezepte in dieser Kategorie gefunden.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
