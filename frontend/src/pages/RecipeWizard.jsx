import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { 
  ArrowLeft, 
  ArrowRight, 
  Link as LinkIcon, 
  Clock, 
  Plus, 
  Minus, 
  Trash,
  Check
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Standard-Werte
const defaultValues = {
  title: "",
  servings: 4,
  prepTime: 45,
  imageUrl: "",
  ingredients: [
    { amount: "500", unit: "g", name: "Hackfleisch" }, // Beispiel aus deinem Screenshot
    { amount: "", unit: "", name: "" }
  ],
  instructions: [{ step: 1, text: "" }]
};

export default function CreateRecipeWizard({ initialData = null }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(initialData ? 2 : 1);
  const [isLoading, setIsLoading] = useState(false);
  const [importUrl, setImportUrl] = useState("");

  // Formular Setup
  const { register, control, handleSubmit, reset, trigger, setValue, watch, formState: { errors } } = useForm({
    defaultValues: initialData || defaultValues,
    mode: "onChange"
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: "ingredients"
  });

  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = useFieldArray({
    control,
    name: "instructions"
  });

  // Beobachte Werte für den Custom Stepper
  const currentServings = watch("servings");

  // --- LOGIK ---
  
  const handleImport = async () => {
    if (!importUrl) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/recipes/analyze?url=${encodeURIComponent(importUrl)}`);
      const data = await res.json();
      reset(data);
      setStep(2);
    } catch (e) {
      alert("Fehler beim Import.");
    }
    setIsLoading(false);
  };

  const nextStep = async () => {
    let isValid = false;

    // Schritt 2: Basisdaten prüfen
    if (step === 2) {
      isValid = await trigger(["title", "servings", "prepTime"]);
    } 
    // NEU: Schritt 3: Zutaten prüfen
    else if (step === 3) {
      // "ingredients" prüft das komplette Array auf Fehler (z.B. required)
      isValid = await trigger("ingredients");
    } 
    // Schritt 4: Zubereitung (Optional oder auch prüfen)
    else if (step === 4) {
       isValid = await trigger("instructions");
    }
    else {
      isValid = true;
    }

    if (isValid) setStep((s) => s + 1);
  };

  const prevStep = () => {
    if (initialData && step === 2) navigate(-1);
    else if (step > 1) setStep((s) => s - 1);
    else navigate(-1);
  };

  const onSubmit = async (data) => {
    setIsLoading(true); // Lade-Spinner aktivieren

    try {
      // 1. Unterscheidung: Bearbeiten oder Neu?
      const isEditMode = !!initialData; // true, wenn wir initialData haben
      
      const url = isEditMode 
        ? `${import.meta.env.VITE_API_URL}/recipes/${initialData.id}` // ID anhängen beim Bearbeiten
        : `${import.meta.env.VITE_API_URL}/recipes`; // Basis-URL beim Erstellen
      
      const method = isEditMode ? "PATCH" : "POST"; // PATCH für Update, POST für Neu

      // 2. Daten bereinigen (Sicherstellen, dass Zahlen wirklich Zahlen sind)
      // Das ist eine Sicherheitsmaßnahme, falls valueAsNumber im HTML mal fehlt
      const cleanData = {
        ...data,
        servings: Number(data.servings),
        prepTime: Number(data.prepTime),
        ingredients: data.ingredients.map(ing => ({
          ...ing,
          amount: Number(ing.amount) // Auch hier sicherstellen
        }))
      };

      // 3. Request senden
      const response = await fetch(url, {
        method: method,
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Speichern des Rezepts");
      }

      // 4. Erfolg!
      // Optional: Hier könntest du noch einen Toast/Notification anzeigen
      console.log("Erfolgreich gespeichert!");
      navigate("/"); // Zurück zur Übersicht

    } catch (error) {
      console.error("Speicher-Fehler:", error);
      alert("Das Rezept konnte leider nicht gespeichert werden. Bitte versuche es erneut.");
    } finally {
      setIsLoading(false); // Lade-Spinner deaktivieren
    }
  };

  // Hilfsfunktion für den Step-Namen oben rechts
  const getStepName = () => {
    switch(step) {
      case 1: return "Import";
      case 2: return "Basisdaten";
      case 3: return "Zutaten";
      case 4: return "Zubereitung";
      default: return "";
    }
  };

  const calculateStep = () => {
    if(!initialData){
      return `Schritt ${step} von ${4}` 
    }
    else return `Schritt ${step-1} von ${3}`
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      {/* --- HEADER --- */}
      <div className="sticky top-0 z-10 bg-white p-4 flex flex-col gap-2 border-b border-border-default">
        <div className="flex justify-between items-end">
          <h1 className="text-sm font-medium tracking-tight">{calculateStep()}</h1>
          <span className="text-sm text-text-subinfo font-medium">{getStepName()}</span>
        </div>
        {/* Progress Bar (Design wie Screenshot 1) */}
        <div className="h-2 w-full bg-border-default rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-teal rounded-full transition-all duration-500 ease-out" 
            style={{ width: initialData ? `${((step-1) / 3) * 100}%` :  `${(step / 4) * 100}%`}} 
          />
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex flex-1 p-4 pb-[85px]">
        
        {/* SCHRITT 1: IMPORT */}
        {step === 1 && (
          <div className="flex flex-1 flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 gap-4 justify-center items-center">
            {/* Das Icon im Kreis */}
            <div className="bg-brand-teal-10 h-24 w-24 rounded-full flex items-center justify-center">
              <LinkIcon size={36} className="text-brand-teal" weight="bold" />
            </div>
            
            <h2 className="text-2xl font-bold">Rezept importieren</h2>
            <p className="text-text-subinfo leading-relaxed">
              Füge eine URL ein, zum Beispiel von Chefkoch.de, um automatisch zu starten
            </p>
            
            <div className="w-full">
              <Input 
                placeholder="https://..." 
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* SCHRITT 2: BASISDATEN */}
        {step === 2 && (
          <div className="flex flex-col flex-1 gap-8 animate-in fade-in slide-in-from-right-8">
            
            {/* Titel */}
            <div className="flex flex-col flex-1 gap-1">
              <Label for="titel">Titel</Label>
              <Input 
                {...register("title", { required: true })} 
                name="titel"
              />
            </div>

            {/* Zubereitungszeit (mit Icon rechts) */}
            <div className="flex flex-col flex-1 gap-1">
              <Label for="prepTime">Zubereitungszeit</Label>
              <div className="relative">
                <Input 
                  type="number"
                  {...register("prepTime", { required: true })} 
                />
                <div className="absolute inset-y-0 right-3 left-14 justify-between flex items-center gap-2 pointer-events-none text-brand-teal">
                  <span className="text-text-subinfo pointer-events-none">Min.</span> 
                  <Clock size={24} weight="bold" />
                </div>
              </div>
            </div>

            {/* Portionen (Custom Stepper wie Screenshot) */}
            <div className="flex flex-col flex-1 gap-1">
              <Label>Portionen</Label>
              <div className="flex items-center justify-between border border-border-default rounded-l h-12 px-2 bg-white">
                 <span className="pl-2 text-lg font-medium">{currentServings}</span>
                 <div className="flex items-center gap-4 pr-2">
                    <button 
                      type="button"
                      onClick={() => setValue("servings", Math.max(1, currentServings - 1))}
                      className="text-brand-teal hover:bg-teal-50 p-1 rounded"
                    >
                      <Minus size={24} weight="bold" />
                    </button>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <button 
                      type="button"
                      onClick={() => setValue("servings", currentServings + 1)}
                      className="text-brand-teal hover:bg-teal-50 p-1 rounded"
                    >
                      <Plus size={24} weight="bold" />
                    </button>
                 </div>
              </div>
            </div>

            {/* Bild URL */}
            <div className="flex flex-col flex-1 gap-1">
               <Label>Bild URL</Label>
               <Input {...register("imageUrl")} placeholder="https://..." />
            </div>
          </div>
        )}

        {/* SCHRITT 3: ZUTATEN */}
        {step === 3 && (
          <div className="flex flex-col flex-1 gap-2 animate-in fade-in slide-in-from-right-8">
            <div className="flex flex-col gap-2">
              {ingredientFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-center">
                  {/* Menge */}
                  <div className="w-20">
                     <Input 
                       placeholder="500"
                       {...register(`ingredients.${index}.amount`)}
                       className="text-center"
                     />
                  </div>
                  {/* Einheit */}
                  <div className="w-20">
                     <Input 
                       placeholder="g"
                       {...register(`ingredients.${index}.unit`)}
                       className="text-center"
                     />
                  </div>
                  {/* Name */}
                  <div className="flex-1">
                     <Input 
                       placeholder="Zutat"
                       {...register(`ingredients.${index}.name`, { required: true })}
                     />
                  </div>
                  {/* Löschen */}
                  <button 
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg ml-1"
                  >
                    <Trash size={24} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Button */}
            <button 
              type="button"
              onClick={() => appendIngredient({ amount: "", unit: "", name: "" })}
              className="flex items-center gap-2 text-gray-900 font-medium mt-2"
            >
              <Plus size={20} weight="bold" /> Zutat hinzufügen
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col flex-1 gap-8 animate-in fade-in slide-in-from-right-8">
             {instructionFields.map((field, index) => (
                <div key={field.id} className="flex flex-1 flex-col gap-0">
                  
                  {/* Header Zeile: Schritt Nummer links, Löschen rechts */}
                  <div className="flex justify-between items-center">
                    <h3 className="flex items-center text-brand-teal font-semibold text-lg h-12">
                      Schritt {index + 1}
                    </h3>
                    
                    <button 
                      type="button"
                      onClick={() => removeInstruction(index)} 
                      className="flex items-center gap-1.5 text-red-500 text-sm font-medium hover:text-red-600 transition-colors"
                    >
                      <Trash size={16} weight="regular" /> Schritt löschen
                    </button>
                  </div>

                  {/* Das Textfeld */}
                  <Textarea 
                    {...register(`instructions.${index}.text`, { required: true })} 
                    className="min-h-[140px] text-base leading-relaxed border-gray-200 rounded-xl focus-visible:ring-teal-500 bg-white resize-none p-4 shadow-sm"
                    placeholder="Beschreibe, was in diesem Schritt passiert..."
                  />
                </div>
             ))}

             {/* Button zum Hinzufügen (Ganz unten) */}
             <button 
              type="button"
              onClick={() => appendInstruction({ step: instructionFields.length + 1, text: "" })}
              className="flex items-center gap-2 text-gray-900 font-medium mt-2 hover:text-teal-500 transition-colors px-1 mt-[-24px]"
            >
              <Plus size={20} weight="bold" /> Schritt hinzufügen
            </button>
            
            {/* Platzhalter unten, damit der Footer nichts verdeckt beim Scrollen */}
            <div className="h-4"></div>
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

        {step < 4 ? (
           <Button 
             onClick={step === 1 ? handleImport : nextStep} 
             disabled={step === 1 && !importUrl}
             className="bg-brand-teal hover:bg-teal-600 text-white rounded-l px-4 py-2 text-sm font-medium flex items-center gap-2"
           >
             {step === 1 ? "Import" : "Weiter"} <ArrowRight size={16} weight="bold" />
           </Button>
        ) : (
           <Button 
             onClick={handleSubmit(onSubmit)} 
             className="bg-brand-teal hover:bg-teal-600 text-white rounded-l px-4 py-2 font-medium text-sm flex items-center gap-2"
           >
             Fertigstellen <Check size={16} weight="bold" />
           </Button>
        )}
      </div>

    </div>
  );
}