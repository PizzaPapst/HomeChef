import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check,
  Calendar,
  ArrowsClockwise // NEU: Icon für Shuffle
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { addDays, eachDayOfInterval, format } from "date-fns";
import { de } from "date-fns/locale"; 
import { DateRangePicker } from "../components/DateRangePicker";

// --- NEUE IMPORTS ---
import { fetchAllRecipes, saveWeeklyPlan} from "@/services/api"; 
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

        // 2. Plan initial füllen
        const newPlan = {};
        const days = eachDayOfInterval({ start: date.from, end: date.to });
        
        days.forEach(day => {
          const key = format(day, "yyyy-MM-dd");
          newPlan[key] = getRandomRecipe(safeRecipes);
        });
        
        console.log(newPlan)
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

  const getStepName = () => {
    switch(step) {
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
          <div className="flex flex-1 flex-col animate-in fade-in slide-in-from-bottom-4 gap-6 items-center justify-center text-center">
            <div className="bg-brand-teal-10 h-24 w-24 rounded-full flex items-center justify-center mb-4">
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
          <div className="flex flex-col flex-1 gap-6 animate-in fade-in slide-in-from-right-8 w-full">
            
            <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold">Dein Plan</h2>
                <p className="text-sm text-text-subinfo">Hier ist ein Vorschlag für deine Woche.</p>
            </div>

            {/* DIE LISTE DER TAGE */}
            <div className="flex flex-col gap-8 pb-10">
              {daysToPlan && daysToPlan.map((day, index) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const recipe = plan[dateKey]; // Das zugewiesene Rezept aus dem State

                return (
                  <div key={index} className="flex flex-col gap-3">
                    
                    {/* Header: Wochentag + Shuffle Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-brand-teal capitalize">
                          {format(day, "EEEE", { locale: de })}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(day, "d. MMM", { locale: de })}
                        </span>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => rerollDay(dateKey)}
                        className="text-gray-400 hover:text-brand-teal h-8 w-8"
                        title="Neues Rezept würfeln"
                      >
                        <ArrowsClockwise size={20} weight="bold" />
                      </Button>
                    </div>

                    {/* Die Karte - Link deaktiviert durch leeres onClick */}
                    <div>
                      <RecipeCard 
                        recipe={recipe} 
                        onClick={() => {}} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>

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