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

export function RecipeCard({ recipe, onClick }) {
  // Fallback Bild
  const image = recipe.imageUrl || "https://images.unsplash.com/photo-1543353071-087092ec393a?q=80&w=1000&auto=format&fit=crop";

  const Content = (
    <Card className="h-full overflow-hidden flex flex-col group border-border-default rounded-2xl shadow-card-shadow text-text-default">

      <div className="relative aspect-[16/9] overflow-hidden p-2 ">
        <img
          src={image}
          alt={recipe.title}
          className="object-cover w-full h-full rounded-lg"
        />
      </div>

      <CardHeader className="px-4 pt-2 pb-0 ">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold line-clamp-2">
            {recipe.title}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-2 flex flex-1 gap-4">
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
    </Card>
  );

  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer active:scale-[0.98] transition-all">
        {Content}
      </div>
    );
  }

  return (
    <Link to={`/recipe/${recipe.id}`}>
      {Content}
    </Link>
  )
}