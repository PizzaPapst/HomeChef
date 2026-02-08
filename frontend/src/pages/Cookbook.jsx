import { Link } from "react-router-dom";
import { RecipeCard } from "../components/RecipeCard";
import { useState, useEffect } from "react";

export default function Cookbook() {
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

      <div className="p-4 h-[76px]">
        
      </div>

      <div className="bg-custom-bg flex flex-col flex-1 gap-8 px-4 pt-6 pb-4 rounded-t-3xl pb-[102px]">
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-lg">Vorschlag des Tages</h2>
            {recipes.length && <RecipeCard recipe={recipes[Math.floor(Math.random() * recipes.length)]}/>}
        </div>
        
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-lg">Alle Rezepte</h2>
            {recipes.length && recipes.map((recipe)=>{
              return <RecipeCard key={recipe.id} recipe={recipe}/>
            })}
        </div>
      </div>
    </div>
  )
}