import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Clock, Fire, ArrowLeft, DotsThreeVertical } from "@phosphor-icons/react";
import { PortionStepper } from "@/components/PortionStepper";
import IngredientEntry from "../components/IngredientEntry";
import CookingStep from "@/components/CookingStep";
import { Button } from "@/components/ui/button";
import { FlyoutMenu } from "@/components/FlyoutMenu";
import { deleteRecipe, fetchRecipeById } from "@/services/api";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [currentServings, setCurrentServings] = useState(0);

  useEffect(() => {
    fetchRecipeById(id).then(data => {
      if (data) {
        setRecipe(data);
        setCurrentServings(data.servings);
      }
    });
  }, [id]);

  if (!recipe) return <div className="p-8 text-center text-text-subinfo">Lädt...</div>;

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
    <div className="flex flex-1 flex-col gap-1 relative">
      <div className="bg-custom-bg flex flex-col flex-1 gap-8">
        <div className="flex flex-col gap-4 w-full relative">
          <img
            src={image}
            alt={recipe.title}
            className="object-cover w-full aspect-[1/1]"
          />

          <div className="flex flex-col gap-4 w-full px-4">
            <h1 className="text-2xl font-bold">{recipe.title}</h1>

            <div className="flex flex-1 gap-2">
              <div className="flex justify-center gap-1 text-text-subinfo">
                <Clock size={22} />
                <p>{recipe.prepTime} Min.</p>
              </div>

              <div className="flex justify-center gap-1 text-text-subinfo">
                <Fire size={22} />
                <p>{"Platzhalter"} kcal</p>
              </div>
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
          {recipe.instructions && recipe.instructions.map((item, index) => (
            <CookingStep key={index} step={item.step} text={item.text} />
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="fab"
        size="icon"
        onClick={() => navigate(-1)}
        className="h-12 w-12 rounded-full bg-white p-0 absolute top-4 left-4 z-50"
      >
        <ArrowLeft size={24} weight="bold" />
        <span className="sr-only">Zurück</span>
      </Button>

      <div className="absolute top-4 right-4 z-50">
        <FlyoutMenu
          trigger={
            <Button
              variant="fab"
              size="icon"
              className="h-12 w-12 rounded-full bg-white p-0"
            >
              <DotsThreeVertical size={24} weight="bold" />
              <span className="sr-only">Menü öffnen</span>
            </Button>
          }
          items={menuItems}
        />
      </div>
    </div>
  )
}