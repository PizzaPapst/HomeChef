import { RecipeCard } from "../components/RecipeCard";
import { TextLink } from "../components/TextLink";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export default function Cookbook() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([])

  const apiUrl = import.meta.env.VITE_API_URL;
  console.log(apiUrl);

  useEffect(() => {
    if (!apiUrl) {
      console.error("API URL fehlt in der .env Datei!");
      return;
    }

    fetch(`${apiUrl}/recipes`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Netzwerkantwort war nicht ok');
        }

        return response.json();
      })
      .then(data => {
        // HIER hast du erst die echten Daten
        console.log("Geladene Rezepte:", data);
        setRecipes(data);
      })
      .catch(error => {
        console.error('Fehler beim Laden:', error);
      });
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-1">

      <div className="bg-custom-bg flex flex-col flex-1 gap-8 px-4 pt-6 pb-[102px]">

        <h1 className="text-2xl font-bold ">Was möchtest du heute essen?</h1>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Rezeptideen</h2>
            <TextLink to="#">Alle anzeigen</TextLink>
          </div>
          {recipes.length && recipes.map((recipe) => {
            return <RecipeCard key={recipe.id} recipe={recipe} />
          })}
        </div>
      </div>

      <Button
        variant="fab"
        size="icon"
        className="fixed bottom-24 right-4 h-[80px] w-[80px] rounded-full z-50 text-text-inverted bg-brand-orange"
        onClick={() => navigate("/recipe/create")}
      >
        <Plus size={28} weight="bold" />
        <span className="sr-only">Neues Rezept erstellen</span>
      </Button>
    </div>
  )
}