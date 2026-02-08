import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export default function RecipeDetail() {
  const { id } = useParams(); // Holt die ID aus der URL (z.B. "123")
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState([])
  const image = recipe.imageUrl || "https://images.unsplash.com/photo-1543353071-087092ec393a?q=80&w=1000&auto=format&fit=crop";

  
    const apiUrl = import.meta.env.VITE_API_URL;
    console.log(apiUrl);
  
    useEffect(() => {
      if (!apiUrl) {
          console.error("API URL fehlt in der .env Datei!");
          return;
      }
  
      fetch(`${apiUrl}/recipes/${id}`) 
        .then(response => {
          if (!response.ok) {
              throw new Error('Netzwerkantwort war nicht ok');
          }
          
          return response.json(); 
        })
        .then(data => {
          // HIER hast du erst die echten Daten
          console.log("Geladenes Rezept:", data);
          setRecipe(data);
        })
        .catch(error => {
          console.error('Fehler beim Laden:', error);
        });
      }, []);

  return (
    <div className="flex flex-1 flex-col gap-1">
    
          <div className="p-4 h-[76px]">
            
          </div>
    
          <div className="bg-custom-bg flex flex-col flex-1 gap-8 px-4 pt-6 pb-4 rounded-t-3xl">
            <div className="flex flex-col gap-4 w-full">
              <h1 className="text-2xl font-bold">{recipe.title}</h1>

              <img 
                src={image} 
                alt={recipe.title} 
                className="object-cover w-full rounded-lg aspect-[16/9]"
              />


            </div>
          </div>
        </div>
  )
}