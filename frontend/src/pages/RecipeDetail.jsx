import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Clock, Fire, ArrowLeft, PencilSimple } from "@phosphor-icons/react";
import { PortionStepper } from "@/components/PortionStepper";
import IngredientEntry from "../components/IngredientEntry";
import CookingStep from "@/components/CookingStep";
import { Button } from "@/components/ui/button";

export default function RecipeDetail() {
  const { id } = useParams(); // Holt die ID aus der URL (z.B. "123")
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState([])
  const image = recipe.imageUrl || "https://images.unsplash.com/photo-1543353071-087092ec393a?q=80&w=1000&auto=format&fit=crop";
  const [currentServings, setCurrentServings] = useState(0);
  
    const apiUrl = import.meta.env.VITE_API_URL;
  
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
          console.log("Geladenes Rezept:", data );
          setRecipe(data);
          setCurrentServings(data.servings)
        })
        .catch(error => {
          console.error('Fehler beim Laden:', error);
        });
      }, []);
  
  const handlePortionChange = (newAmount) => {
    if (newAmount >= 1) {
      setCurrentServings(newAmount);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-1">
          <div className="bg-custom-bg flex flex-col flex-1 gap-8">
            <div className="flex flex-col gap-4 w-full">
              <img 
                src={image} 
                alt={recipe.title} 
                className="object-cover w-full aspect-[1/1]"
              />
              
              <div className="flex flex-col gap-4 w-full px-4">

              <h1 className="text-2xl font-bold">{recipe.title}</h1>
              
              <div className="flex flex-1 gap-2">
                <div className="flex justify-center gap-1 text-text-subinfo">
                  <Clock
                    size={22}
                    />
                  <p>{recipe.prepTime} Min.</p>
                </div>
      
                <div className="flex justify-center gap-1 text-text-subinfo">
                  <Fire
                    size={22}
                    />
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
                {
                  recipe.ingredients && recipe.ingredients.map((ingredient, index)=><IngredientEntry key={index} name={ingredient.name} unit={ingredient.unit} amount={ingredient.amount} multiplicator={currentServings/recipe.servings}/>)
                }
              </div>
            </div>

            <div className="flex flex-col gap-4 px-4">
              <h2 className="font-semibold text-lg">Zubereitung</h2>
                {
                  recipe.instructions && recipe.instructions.map((item, id)=><CookingStep key={id} step={item.step} text={item.text}  />)
                }
            </div>

          </div> 

          <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="h-12 w-12 rounded-full bg-white p-0 absolute top-4 left-4 z-50"
            >
              <ArrowLeft size={28} weight="bold" />
              <span className="sr-only">Zurück</span> {/* Wichtig für Screenreader! */}
          </Button>
          
          <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate(`/recipes/${id}/edit`)}
              className="h-12 w-12 rounded-full bg-white p-0 absolute top-4 right-4 z-50"
            >
              <PencilSimple size={28} weight="bold" />
              <span className="sr-only">Zurück</span> {/* Wichtig für Screenreader! */}
          </Button>
    </div>
  )
}