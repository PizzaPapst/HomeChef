import { useState, useEffect, useEffectEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check,
  Calendar,
  ListDashes
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { addDays } from "date-fns";
import { DateRangePicker } from "../components/DateRangePicker";
import { eachDayOfInterval, format } from "date-fns";
import { de } from "date-fns/locale"; // Damit "Montag" statt "Monday" steht

// Standard-Werte für den Wochenplan
const defaultValues = {
  startDate: "",
  endDate: "",
  days: [] // Wird später gefüllt mit { date: "...", recipeId: ... }
};

export default function WeeklyPlanWizard() {
  const [date, setDate] = useState({
    from: new Date(),
    to: addDays(new Date(), 6),
  })



  const navigate = useNavigate();
  // Wir starten bei Schritt 1. Total Schritte: 2
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const totalSteps = 2;

  const daysToPlan = (date?.from && date?.to) 
    ? eachDayOfInterval({
        start: date.from,
        end: date.to
      }) 
    : [];
  
  // Formular Setup
  const { register, control, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm({
    defaultValues: defaultValues,
    mode: "onChange"
  });

  // --- LOGIK ---

  const nextStep = async () => {
    let isValid = false;

    // Schritt 1: Zeitraum prüfen
    if (step === 1) {
      // Hier später validieren, ob startDate/endDate gesetzt sind
      // isValid = await trigger(["startDate", "endDate"]);
      isValid = true; // Vorläufig true für UI Tests
    } 
    // Schritt 2: Planung prüfen
    else if (step === 2) {
       isValid = true;
    }

    if (isValid) setStep((s) => s + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep((s) => s - 1);
    else navigate(-1); // Zurück zur Übersicht, wenn man bei Schritt 1 zurück klickt
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      console.log("Speichere Wochenplan:", data);
      
      // HIER SPÄTER: API Aufruf
      // await saveWeek(data);

      navigate("/plan"); // Zurück zur Übersicht
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hilfsfunktion für den Step-Namen oben rechts
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
        {/* Progress Bar */}
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

        {/* SCHRITT 2: PLANUNG (Tage Liste) */}
        {step === 2 && (
          <div className="flex flex-col flex-1 gap-4 animate-in fade-in slide-in-from-right-8 w-full">
            
            <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold">Dein Plan</h2>
                <p className="text-sm text-text-subinfo">Füge Gerichte zu den Tagen hinzu</p>
            </div>

            
            {daysToPlan && daysToPlan.map((day, index) => (
                <h2 key={index}>Test</h2>
            ))}

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
             className="bg-brand-teal hover:bg-teal-600 text-white rounded-l px-4 py-2 text-sm font-medium flex items-center gap-2"
           >
             Weiter <ArrowRight size={16} weight="bold" />
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