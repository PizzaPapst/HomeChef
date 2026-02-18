import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  ArrowsClockwise,
  DotsThreeVertical,
  X,
  HandPointing,
  CaretRight,
  Plus
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { addDays, eachDayOfInterval, format } from "date-fns";
import { de } from "date-fns/locale";
import { DateRangePicker } from "../components/DateRangePicker";

// --- NEUE IMPORTS ---
import { fetchAllRecipes, saveWeeklyPlan } from "@/services/api";
import { RecipeCard } from "../components/RecipeCard";

const defaultValues = {
  startDate: "",
  endDate: "",
  days: []
};



export default function WeeklyPlanWizard() {
  const navigate = useNavigate();

  // State für Datum
  const [date, setDate] = useState({
    from: new Date(),
    to: addDays(new Date(), 6),
  });

  // Wizard State
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const totalSteps = 2;

  // --- NEUER LOGIK STATE ---
  const [recipes, setRecipes] = useState([]);
  const [plan, setPlan] = useState({});
  const [isSelectionOpen, setIsSelectionOpen] = useState(false);
  const [selectedDateKey, setSelectedDateKey] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // Berechnete Tage (Derived State)
  const daysToPlan = (date?.from && date?.to)
    ? eachDayOfInterval({ start: date.from, end: date.to })
    : [];

  const { handleSubmit } = useForm({
    defaultValues: defaultValues,
    mode: "onChange"
  });

  // --- HELPER FUNKTIONEN ---
  const getRandomRecipe = (pool) => {
    if (!pool || pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const rerollDay = (dateKey) => {
    setPlan(prev => ({
      ...prev,
      [dateKey]: getRandomRecipe(recipes)
    }));
  };

  // --- NAVIGATION & LOGIK ---

  const nextStep = async () => {
    // SPEZIALFALL: Von Schritt 1 auf 2 -> Laden & Generieren
    if (step === 1) {
      // Validierung: Datum muss da sein
      if (!date.from || !date.to) return;

      setIsLoading(true);
      try {
        // 1. Alle Rezepte holen
        const loadedRecipes = await fetchAllRecipes();
        const safeRecipes = Array.isArray(loadedRecipes) ? loadedRecipes : [];
        setRecipes(safeRecipes);

        // 2. Plan initial LEER füllen (User Wunsch)
        const newPlan = {};
        const days = eachDayOfInterval({ start: date.from, end: date.to });

        days.forEach(day => {
          const key = format(day, "yyyy-MM-dd");
          newPlan[key] = null; // Platzhalter
        });

        setPlan(newPlan);
        setStep(2); // Weitergehen

      } catch (error) {
        console.error("Fehler beim Laden:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Normaler Schritt
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep((s) => s - 1);
    else navigate(-1);
  };

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      // Daten für Backend vorbereiten
      const payload = {
        startDate: date.from.toISOString(),
        endDate: date.to.toISOString(),
        // Wir wandeln das 'plan' Objekt in eine Liste um
        days: Object.entries(plan).map(([dateKey, recipe]) => ({
          date: new Date(dateKey).toISOString(),
          recipeId: recipe?.id
        })).filter(entry => entry.recipeId) // Nur Einträge mit Rezept
      };

      console.log("Speichere Wochenplan:", payload);

      await saveWeeklyPlan(payload);

      navigate("/plan");
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openSelection = (dateKey) => {
    setSelectedDateKey(dateKey);
    setIsSelectionOpen(true);
  };

  const selectRecipeForDay = (recipe) => {
    setPlan(prev => ({
      ...prev,
      [selectedDateKey]: recipe
    }));
    setIsSelectionOpen(false);
  };

  const getStepName = () => {
    switch (step) {
      case 1: return "Zeitraum wählen";
      case 2: return "Gerichte planen";
      default: return "";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* --- HEADER --- */}
      <div className="sticky top-0 z-10 bg-white p-4 flex flex-col gap-2 border-b border-border-default">
        <div className="flex justify-between items-end">
          <h1 className="text-sm font-medium tracking-tight">Schritt {step} von {totalSteps}</h1>
          <span className="text-sm text-text-subinfo font-medium">{getStepName()}</span>
        </div>
        <div className="h-2 w-full bg-border-default rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-teal rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex flex-1 p-4 pb-[85px]">

        {/* SCHRITT 1: ZEITRAUM */}
        {step === 1 && (
          <div className="flex flex-1 flex-col animate-in fade-in slide-in-from-bottom-4 gap-4 items-center justify-center text-center">
            <div className="bg-brand-teal-10 h-[80px] w-[80px] rounded-full flex items-center justify-center">
              <Calendar size={36} className="text-brand-teal" />
            </div>
            <h2 className="text-2xl font-bold">Wann möchtest du planen?</h2>
            <p className="text-text-subinfo max-w-xs">
              Wähle den Start- und Endzeitpunkt für deinen neuen Wochenplan.
            </p>
            <DateRangePicker date={date} setDate={setDate} />
          </div>
        )}

        {/* SCHRITT 2: PLANUNG (Angepasst) */}
        {step === 2 && (
          <div className="flex flex-col flex-1 gap-8 animate-in fade-in slide-in-from-right-8 w-full">

            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold">Dein Plan</h2>
              <p className="text-sm text-text-subinfo">Hier ist ein Vorschlag für deine Woche.</p>
            </div>

            {/* DIE LISTE DER TAGE */}
            <div className="flex flex-col gap-8">
              {daysToPlan && daysToPlan.map((day, index) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const recipe = plan[dateKey]; // Das zugewiesene Rezept aus dem State

                return (
                  <div key={index} className="flex flex-col gap-0">

                    {/* Header: Wochentag + Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-semibold text-brand-teal capitalize">
                          {format(day, "EEEE", { locale: de })}
                        </span>
                        <span className="text-sm text-text-subinfo">
                          {format(day, "d. MMM", { locale: de })}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => rerollDay(dateKey)}
                          className="text-gray-400 hover:text-brand-teal h-10 w-10"
                          title="Zufälliges Rezept"
                        >
                          <ArrowsClockwise size={20} weight="bold" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-brand-teal h-10 w-10"
                        >
                          <DotsThreeVertical size={24} weight="bold" />
                        </Button>
                      </div>
                    </div>

                    {/* Die Karte - Klick öffnet manuelle Auswahl. Placeholder wenn kein Rezept. */}
                    <div className="group transition-all">
                      {recipe ? (
                        <RecipeCard
                          recipe={recipe}
                          onClick={() => openSelection(dateKey)}
                        />
                      ) : (
                        <div
                          onClick={() => openSelection(dateKey)}
                          className="aspect-[16/9] w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-100 hover:border-brand-teal-20 transition-all active:scale-[0.98]"
                        >
                          <div className="bg-white p-3 rounded-full shadow-sm text-gray-400 group-hover:text-brand-teal transition-colors">
                            <Plus size={24} weight="bold" />
                          </div>
                          <span className="text-sm font-medium text-text-subinfo group-hover:text-brand-teal transition-colors">
                            Rezept auswählen
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>

      {/* --- RECIPE SELECTION MODAL --- */}
      {isSelectionOpen && (
        <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-bottom duration-300 flex flex-col">
          <div className="p-4 border-b border-border-default flex items-center justify-between sticky top-0 bg-white">
            <h2 className="text-xl font-bold">Rezept auswählen</h2>
            <Button variant="ghost" onClick={() => setIsSelectionOpen(false)}>Schließen</Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-4">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => selectRecipeForDay(recipe)}
                  className="flex items-center gap-4 p-2 active:bg-gray-50 rounded-xl transition-colors border border-transparent active:border-border-default"
                >
                  <img
                    src={recipe.imageUrl || "https://images.unsplash.com/photo-1543353071-087092ec393a?q=80&w=1000&auto=format&fit=crop"}
                    alt={recipe.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{recipe.title}</h3>
                    <p className="text-sm text-text-subinfo">{recipe.prepTime} Min.</p>
                  </div>
                  <CaretRight size={20} className="text-gray-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-border-default flex justify-between items-center z-20">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 text-text-default px-4 py-2 hover:text-gray-600 text-sm"
        >
          <ArrowLeft size={16} weight="bold" />
          {step === 1 ? "Abbrechen" : "Zurück"}
        </button>

        {step < totalSteps ? (
          <Button
            onClick={nextStep}
            disabled={isLoading}
            className="bg-brand-teal hover:bg-teal-600 text-white rounded-l px-4 py-2 text-sm font-medium flex items-center gap-2"
          >
            {isLoading ? "Laden..." : "Plan erstellen"} <ArrowRight size={16} weight="bold" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit(onSubmit)}
            className="bg-brand-teal hover:bg-teal-600 text-white rounded-l px-4 py-2 font-medium text-sm flex items-center gap-2"
          >
            Speichern <Check size={16} weight="bold" />
          </Button>
        )}
      </div>

    </div>
  );
}