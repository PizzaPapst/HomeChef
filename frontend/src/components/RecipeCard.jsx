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
import { Clock, ChefHat, ArrowRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

export function RecipeCard({ recipe }) {
  // Fallback Bild
  const image = recipe.imageUrl || "https://images.unsplash.com/photo-1543353071-087092ec393a?q=80&w=1000&auto=format&fit=crop";

  return (
    <Link to={`/recipe/${recipe.id}`}>
      {/* Die Card Komponente nimmt ganz normale Tailwind Klassen an (className).
         h-full sorgt dafür, dass alle Karten im Grid gleich hoch sind.
         hover:shadow-lg macht einen schönen Effekt beim Drüberfahren.
      */}
      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col group border-gray-100">
        
        {/* BILD BEREICH */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={image} 
            alt={recipe.title} 
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Ein Badge oben rechts für die Zeit - sieht sehr modern aus */}
          <Badge variant="secondary" className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white flex gap-1 shadow-sm">
            <Clock size={14} weight="bold" />
            {recipe.prepTime || 45} Min.
          </Badge>
        </div>

        {/* HEADER: Titel & Infos */}
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-bold line-clamp-1">
              {recipe.title}
            </CardTitle>
          </div>
          <CardDescription className="flex items-center gap-2 text-xs mt-1">
             {/* Beispiel für Kategorie oder Schwierigkeit */}
             <span className="flex items-center gap-1 text-teal-600 font-medium">
               <ChefHat size={16} />
               Einfach
             </span>
          </CardDescription>
        </CardHeader>

        {/* CONTENT: Kurze Beschreibung (Optional) */}
        <CardContent className="p-4 pt-0 flex-1">
          <p className="text-sm text-gray-500 line-clamp-2">
            Ein leckeres Gericht, das schnell zubereitet ist und jedem schmeckt. 
            Perfekt für den Feierabend!
          </p>
        </CardContent>

        {/* FOOTER: Button */}
        <CardFooter className="p-4 pt-0 mt-auto">
          {/* w-full macht den Button so breit wie die Karte */}
          <Button className="w-full bg-gray-900 hover:bg-teal-600 transition-colors group-hover:bg-teal-600">
            Zum Rezept <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>

      </Card>
    </Link>
  )
}