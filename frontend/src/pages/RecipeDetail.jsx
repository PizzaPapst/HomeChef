import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Clock, Fire, ArrowLeft, DotsThreeVertical } from "@phosphor-icons/react";
import { PortionStepper } from "@/components/PortionStepper";
import IngredientEntry from "../components/IngredientEntry";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/IconButton";
import { FlyoutMenu } from "@/components/FlyoutMenu";
import { deleteRecipe, fetchRecipeById } from "@/services/api";
import Header from "../components/ui/Header";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentServings, setCurrentServings] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchRecipeById(id)
      .then(data => {
        if (data) {
          setRecipe(data);
          setCurrentServings(data.servings);
        } else {
          setError("Rezept wurde nicht gefunden.");
        }
      })
      .catch(err => {
        console.error("Fehler beim Laden:", err);
        setError("Ein Fehler ist beim Laden des Rezepts aufgetreten.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-8 text-center text-text-subinfo">Lädt...</div>;
  if (error) return (
    <div className="p-8 flex flex-col items-center gap-4">
      <p className="text-center text-red-500 font-medium">{error}</p>
      <Button onClick={() => navigate("/")}>Zurück zum Kochbuch</Button>
    </div>
  );
  if (!recipe) return null;

  const image = recipe.imageUrl || "https://images.unsplash.com/photo-1543353071-087092ec393a?q=80&w=1000&auto=format&fit=crop";

  const handlePortionChange = (newAmount) => {
    if (newAmount >= 1) {
      setCurrentServings(newAmount);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Möchtest du dieses Rezept wirklich löschen?")) {
      try {
        await deleteRecipe(id);
        navigate("/");
      } catch (error) {
        console.error("Fehler beim Löschen:", error);
        alert("Fehler beim Löschen des Rezepts.");
      }
    }
  };

  const menuItems = [
    {
      label: "Bearbeiten",
      onClick: () => navigate(`/recipes/${id}/edit`),
    },
    {
      label: "Löschen",
      onClick: handleDelete,
      className: "text-red-500 hover:bg-red-50",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden pb-20">
      {/* Header with Actions */}
      <Header className="justify-between">
        <IconButton
          variant="standalone"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={20} weight="bold" />
        </IconButton>

        <FlyoutMenu
          trigger={
            <IconButton variant="standalone">
              <DotsThreeVertical size={24} weight="bold" />
            </IconButton>
          }
          items={menuItems}
        />
      </Header>

      <div className="flex-1 overflow-y-auto no-scrollbar overscroll-contain">
        {/* Hero Section */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4 w-full relative">
            <img
              src={image}
              alt={recipe.title}
              className="object-cover w-full aspect-[4/3]"
            />

            <div className="flex flex-col gap-4 w-full px-4">
              <h1 className="text-2xl font-bold">{recipe.title}</h1>

              <div className="flex gap-4">
                <div className="flex items-center gap-1 text-text-subinfo">
                  <Clock size={20} />
                  <p className="text-sm">{recipe.prepTime} Min.</p>
                </div>

                {recipe.calories > 0 && (
                  <div className="flex items-center gap-1 text-text-subinfo">
                    <Fire size={20} />
                    <p className="text-sm">{recipe.calories} kcal</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 px-4">
            <h2 className="font-semibold text-lg">Zutaten</h2>
            <PortionStepper
              servings={currentServings}
              onUpdate={handlePortionChange}
            />
            <div className='flex flex-col'>
              {recipe.ingredients && recipe.ingredients.map((ingredient, index) => (
                <IngredientEntry
                  key={index}
                  name={ingredient.name}
                  unit={ingredient.unit}
                  amount={ingredient.amount}
                  multiplicator={currentServings / recipe.servings}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 px-4 pb-12">
            <h2 className="font-semibold text-lg">Zubereitung</h2>
            <div className="flex flex-col gap-4">
              {recipe.instructions && recipe.instructions.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-brand-teal-10 text-brand-teal font-bold rounded-full text-xs">
                    {index + 1}
                  </span>
                  <p className="text-text-default leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}