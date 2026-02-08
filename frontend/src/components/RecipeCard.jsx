// 1. Die neuen shadcn Komponenten importieren
// Falls "@/" bei dir Fehler wirft, nutze "../components/ui/card" etc.
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Icons (Wir bleiben bei Phosphor, wie du wolltest)
import { Clock, Fire } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

export function RecipeCard({ recipe }) {
  // Fallback Bild
  const image = recipe.imageUrl || "https://images.unsplash.com/photo-1543353071-087092ec393a?q=80&w=1000&auto=format&fit=crop";

  return (
    <Link to={`/recipe/${recipe.id}`}>
      <Card className="h-full overflow-hidden flex flex-col group border-border-default rounded-2xl shadow-card-shadow text-text-default">
        
        <div className="relative aspect-[16/9] overflow-hidden p-2 ">
          <img 
            src={image} 
            alt={recipe.title} 
            className="object-cover w-full h-full rounded-lg"
          />
          
          {/* <Badge variant="secondary" className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white flex gap-1 shadow-sm">
            <Clock size={14} weight="bold" />
            {recipe.prepTime || 45} Min.
          </Badge> */}
        </div>

        {/* HEADER: Titel & Infos */}
        <CardHeader className="px-4 pt-2 pb-0 ">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold line-clamp-2">
              {recipe.title}
            </CardTitle>
          </div>
          {/* <CardDescription className="flex items-center gap-2 text-xs mt-1">
             <span className="flex items-center gap-1 text-teal-600 font-medium">
               <ChefHat size={16} />
               Einfach
             </span>
          </CardDescription> */}
        </CardHeader>

        {/* CONTENT: Kurze Beschreibung (Optional) */}
        <CardContent className="p-4 flex flex-1 gap-4">
          <div className="flex gap-1 text-text-subinfo">
            <Clock
              size={22}
            />
            <p>{recipe.prepTime} Min.</p>
          </div>

          <div className="flex gap-1 text-text-subinfo">
            <Fire
              size={22}
            />
            <p>{"Platzhalter"} kcal</p>
          </div>
        </CardContent>

        {/* <CardFooter className="p-4 pt-0 mt-auto">
          <Button className="w-full bg-gray-900 hover:bg-teal-600 transition-colors group-hover:bg-teal-600">
            Zum Rezept <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter> */}

      </Card>
    </Link>
  )
}