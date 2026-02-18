import { Plus, DotsThreeVertical } from "@phosphor-icons/react"; // DotsThreeVertical hinzugefügt
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react"; // useEffect hinzugefügt
import { format } from "date-fns"; // hinzugefügt
import { de } from "date-fns/locale"; // hinzugefügt

// Deine Services/Components
import { getAllMealPlans } from "@/services/api";
import { RecipeCard } from "../components/RecipeCard";

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
    // 'pb-32' sorgt dafür, dass die letzte Karte nicht hinter dem Button verschwindet
    <div className="px-4 pt-6 min-h-screen bg-white pb-[102px] flex flex-col gap-4">

      {/* mb-8 für etwas Abstand zur Liste */}
      <h1 className="text-2xl font-bold">Wochenplan</h1>

      {/* --- NEU: Listen-Bereich Start --- */}
      <div className="flex flex-col gap-8">

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
                <button className="text-gray-400">
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
        className="fixed bottom-24 right-4 h-[80px] w-[80px] rounded-full z-50 text-text-inverted bg-brand-orange"
        onClick={() => navigate("/plan/create")}
      >
        <Plus size={28} weight="bold" />
        <span className="sr-only">Neues Rezept erstellen</span>
      </Button>
    </div>
  )
}