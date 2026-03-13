import { Plus, DotsThreeVertical } from "@phosphor-icons/react"; // DotsThreeVertical hinzugefügt
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react"; // useEffect hinzugefügt
import { format } from "date-fns"; // hinzugefügt
import { de } from "date-fns/locale"; // hinzugefügt

// Deine Services/Components
import { getAllMealPlans } from "@/services/api";
import { RecipeCard } from "../components/RecipeCard";

import Header from "../components/ui/Header";

export default function WeeklyPlan() {

  const navigate = useNavigate();

  // --- NEU: State & Fetch Logic ---
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getAllMealPlans();
        setPlans(data || []);
      } catch (e) {
        console.error("Fehler beim Laden:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  // ------------------------------

  return (
    <div className="flex flex-col h-full bg-bg-alternation pb-24 overflow-hidden">
      {/* Header */}
      <Header>
        <h1 className="text-xl text-text-primary">Wochenplan</h1>
      </Header>

      {/* Content */}
      <div className="flex flex-col gap-6 p-4 flex-1 overflow-y-auto no-scrollbar overscroll-contain">

        {isLoading && <p className="text-gray-400 text-sm">Lade Pläne...</p>}

        {!isLoading && plans.length === 0 && (
          <p className="text-gray-400 text-sm">Noch nichts geplant.</p>
        )}

        {plans.map((plan) => {
          const date = new Date(plan.date);

          return (
            <div key={plan.id} className="flex flex-col gap-3">

              {/* Header: Tag & Datum */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-brand-teal capitalize">
                    {format(date, "EEEE", { locale: de })}
                  </span>
                  <span className="text-gray-500 font-medium text-sm">
                    {format(date, "d MMM", { locale: de })}
                  </span>
                </div>
                {/* 3 Punkte Menü Icon */}
                <button className="text-gray-400 h-14 w-14 flex items-center justify-center">
                  <DotsThreeVertical size={24} weight="bold" />
                </button>
              </div>

              {/* Die Karte */}
              <div className="h-full">
                <RecipeCard recipe={plan.recipe} />
              </div>

            </div>
          );
        })}
      </div>
      {/* --- Listen-Bereich Ende --- */}

      {/* Dein Original Button */}
      <Button
        variant="fab"
        size="icon"
        className="fixed bottom-24 right-4 h-16 w-16 rounded-full z-50 text-text-inverted bg-brand-orange border-none shadow-fab-shadow"
        onClick={() => navigate("/plan/create")}
      >
        <Plus size={24} weight="bold" />
        <span className="sr-only">Neues Rezept erstellen</span>
      </Button>
    </div>
  )
}