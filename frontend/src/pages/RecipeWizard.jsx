import { useState, useEffect } from "react";
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
  Check,
  DotsSixVertical
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
    { amount: "500", unit: "g", name: "Hackfleisch" }
  ],
  instructions: [{ step: 1, text: "" }],
  calories: 0
};

const UNITS = [
  "g", "kg", "ml", "l", "Stk.", "Pck.", "Dose", "Bd.", "Zehe", "EL", "TL", "Prise", "Spritzer", "Etwas"
];

// Entfällt, da wir jetzt den Backend-Proxy nutzen
// import { translateIngredients } from "@/services/translation";

export default function CreateRecipeWizard({ initialData = null }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(initialData ? 2 : 1);
  const [isLoading, setIsLoading] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [openUnitIndex, setOpenUnitIndex] = useState(null); // Track which unit dropdown is open

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

  // Beobachte Werte für den Custom Stepper & Combobox
  const currentServings = watch("servings");
  const watchedIngredients = watch("ingredients");

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
    // Schritt 3: Zutaten prüfen + Kalorien berechnen
    else if (step === 3) {
      isValid = await trigger("ingredients");
      if (isValid) {
        // Starte Kalorienberechnung im Hintergrund
        fetchCalories();
      }
    }
    // Schritt 4: Kalorien bestätigen
    else if (step === 4) {
      isValid = await trigger("calories");
    }
    // Schritt 5: Zubereitung
    else if (step === 5) {
      isValid = await trigger("instructions");
    }
    else {
      isValid = true;
    }

    if (isValid) setStep((s) => s + 1);
  };

  const fetchCalories = async () => {
    const ingredients = watchedIngredients;
    const title = watch("title");
    
    // Namen für das Backend vorbereiten
    const namesOnly = ingredients.map(ing => {
      // Wir senden Menge + Einheit + Name als String, 
      // damit das Backend (Edamam) es korrekt parsen kann.
      return `${ing.amount} ${ing.unit} ${ing.name}`.trim();
    });
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/recipes/analyze-ingredients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          ingredients: namesOnly,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.calories) {
          const servings = watch("servings") || 1;
          const caloriesPerServing = Math.round(data.calories / servings);
          setValue("calories", caloriesPerServing);
        }
      }
    } catch (e) {
      console.error("Fehler bei der Kalorienberechnung via Backend-Proxy:", e);
    }
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
        })),
        calories: Number(data.calories)
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
    switch (step) {
      case 1: return "Import";
      case 2: return "Basisdaten";
      case 3: return "Zutaten";
      case 4: return "Kalorien";
      case 5: return "Zubereitung";
      default: return "";
    }
  };

  const calculateStep = () => {
    const totalSteps = initialData ? 4 : 5;
    if (!initialData) {
      return `Schritt ${step} von ${totalSteps}`;
    }
    else return `Schritt ${step - 1} von ${totalSteps - 1}`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">

      {/* --- HEADER --- */}
      <div className="flex-none bg-white p-4 flex flex-col gap-2 border-b border-border-default z-10">
        <div className="flex justify-between items-end">
          <h1 className="text-sm font-medium tracking-tight">{calculateStep()}</h1>
          <span className="text-sm text-text-subinfo font-medium">{getStepName()}</span>
        </div>
        {/* Progress Bar (Design wie Screenshot 1) */}
        <div className="h-2 w-full bg-border-default rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-teal rounded-full transition-all duration-500 ease-out"
            style={{ width: initialData ? `${((step - 1) / 4) * 100}%` : `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex flex-1 flex-col p-4 overflow-y-auto no-scrollbar">

        {/* SCHRITT 1: IMPORT */}
        {step === 1 && (
          <div className="flex flex-1 flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 gap-4 justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-6">
                <div className="h-16 w-16 border-4 border-brand-teal-10 border-t-brand-teal rounded-full animate-spin"></div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold">Magie im Gange...</h2>
                  <p className="text-text-subinfo">
                    Wir extrahieren das Rezept für dich. <br />
                    Bei Videos kann das bis zu 30 Sekunden dauern.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-brand-teal-10 h-[80px] w-[80px] rounded-full flex items-center justify-center">
                  <LinkIcon size={36} className="text-brand-teal" weight="bold" />
                </div>

                <h2 className="text-2xl font-bold">Rezept importieren</h2>
                <p className="text-text-subinfo leading-relaxed">
                  Füge einen Link von YouTube, Instagram, TikTok oder Chefkoch ein
                </p>

                <div className="w-full">
                  <Input
                    placeholder="https://..."
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* SCHRITT 2: BASISDATEN */}
        {step === 2 && (
          <div className="flex flex-col flex-1 gap-8 animate-in fade-in slide-in-from-right-8">

            {/* Titel */}
            <div className="flex flex-col flex-1 gap-1">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                {...register("title", { required: true })}
              />
            </div>

            {/* Zubereitungszeit (mit Icon rechts) */}
            <div className="flex flex-col flex-1 gap-1">
              <Label htmlFor="prepTime">Zubereitungszeit</Label>
              <div className="relative">
                <Input
                  id="prepTime"
                  type="number"
                  {...register("prepTime", { required: true })}
                />
                <div className="absolute inset-y-0 right-3 left-14 justify-between flex items-center gap-2 pointer-events-none text-brand-teal">
                  <span className="text-text-subinfo pointer-events-none">Min.</span>
                </div>
              </div>
            </div>

            {/* Portionen (Custom Stepper wie Screenshot) */}
            <div className="flex flex-col flex-1 gap-1">
              <Label>Portionen</Label>
              <div className="flex items-center justify-between border border-border-default rounded-l h-12 px-2 bg-white">
                <span className="pl-2 text-lg font-medium">{currentServings}</span>
                <div className="flex items-center gap-4 pr-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setValue("servings", Math.max(1, currentServings - 1))}
                    className="text-brand-teal p-1 w-10 h-10"
                  >
                    <Minus size={24} weight="bold" />
                  </Button>
                  <div className="h-6 w-px bg-gray-200"></div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setValue("servings", currentServings + 1)}
                    className="text-brand-teal p-1 w-10 h-10"
                  >
                    <Plus size={24} weight="bold" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Bild URL */}
            <div className="flex flex-col flex-1 gap-1">
              <Label htmlFor="imageUrl">Bild URL</Label>
              <Input id="imageUrl" {...register("imageUrl")} placeholder="https://..." />
            </div>
          </div>
        )}

        {/* SCHRITT 3: ZUTATEN */}
        {step === 3 && (
          <div className="flex flex-col flex-1 gap-8 animate-in fade-in slide-in-from-right-8">
            <div className="flex flex-col gap-6">
              {ingredientFields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-center animate-in fade-in slide-in-from-bottom-2">

                  {/* Drag Handle */}
                  <div className="text-text-subinfo">
                    <DotsSixVertical size={24} />
                  </div>

                  {/* Input Box Container */}
                  <div className="flex-1 flex flex-col border border-border-default rounded-lg bg-white shadow-sm">
                    {/* Top Row: Amount & Unit */}
                    <div className="flex border-b border-border-default h-14">
                      <div className="w-[33%] flex items-center px-4">
                        <input
                          placeholder="Menge"
                          {...register(`ingredients.${index}.amount`)}
                          className="w-full text-lg focus:outline-none placeholder:text-text-subinfo"
                        />
                      </div>
                      <div className="w-px bg-border-default h-full"></div>
                      <div className="flex-1 relative flex items-center">
                        <input
                          placeholder="Einheit"
                          {...register(`ingredients.${index}.unit`)}
                          onFocus={() => setOpenUnitIndex(index)}
                          onBlur={() => setTimeout(() => setOpenUnitIndex(null), 300)}
                          className="w-full h-full px-4 text-lg focus:outline-none placeholder:text-text-subinfo bg-transparent"
                          autoComplete="off"
                        />

                        {/* Custom Flyout / Combobox Options */}
                        {openUnitIndex === index && (() => {
                          const currentUnitValue = watchedIngredients?.[index]?.unit || "";
                          const filteredUnits = UNITS.filter(u =>
                            u.toLowerCase().startsWith(currentUnitValue.toLowerCase())
                          );

                          if (filteredUnits.length === 0 && currentUnitValue !== "") return null;

                          return (
                            <div className="absolute top-full left-0 right-0 z-[100] mt-1 bg-white border border-border-default rounded shadow-card-shadow max-h-[192px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                              <div className="py-1">
                                {(filteredUnits.length > 0 ? filteredUnits : UNITS).map(unit => (
                                  <Button
                                    key={unit}
                                    type="button"
                                    variant="ghost"
                                    onMouseDown={() => {
                                      setValue(`ingredients.${index}.unit`, unit);
                                      setOpenUnitIndex(null);
                                    }}
                                    className="w-full justify-start rounded-none h-auto py-3 px-4 text-left font-normal"
                                  >
                                    {unit}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Bottom Row: Name */}
                    <div className="h-14 flex items-center px-4">
                      <input
                        placeholder="Zutat"
                        {...register(`ingredients.${index}.name`, { required: true })}
                        className="w-full text-lg focus:outline-none placeholder:text-text-subinfo"
                      />
                    </div>
                  </div>

                  {/* Delete Button */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeIngredient(index)}
                    className="p-2"
                  >
                    <Trash size={28} />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add Button */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => appendIngredient({ amount: "", unit: "", name: "" })}
              className="flex items-center gap-2 font-medium"
            >
              <Plus size={20} weight="bold" /> Zutat hinzufügen
            </Button>
          </div>
        )}

        {/* SCHRITT 4: KALORIEN */}
        {step === 4 && (
          <div className="flex flex-col flex-1 gap-8 animate-in fade-in slide-in-from-right-8">
            <div className="flex flex-1 flex-col items-center text-center gap-4 justify-center">
               <div className="bg-brand-teal-10 h-[80px] w-[80px] rounded-full flex items-center justify-center">
                  <Clock size={36} className="text-brand-teal" weight="bold" />
                </div>
                <h2 className="text-2xl font-bold">Kalorien überprüfen</h2>
                <p className="text-text-subinfo leading-relaxed">
                  Basierend auf deinen Zutaten haben wir die Kalorien geschätzt. Du kannst diese hier anpassen.
                </p>
                <div className="w-full max-w-[200px]">
                  <Label htmlFor="calories">Kalorien (kcal)</Label>
                  <Input 
                    id="calories"
                    type="number"
                    {...register("calories")}
                    className="text-center text-2xl font-bold h-16"
                  />
                </div>
            </div>
          </div>
        )}

        {/* SCHRITT 5: ZUBEREITUNG */}
        {step === 5 && (
          <div className="flex flex-col flex-1 gap-8 animate-in fade-in slide-in-from-right-8">
            {instructionFields.map((field, index) => (
              <div key={field.id} className="flex flex-1 flex-col gap-0">

                {/* Header Zeile: Schritt Nummer links, Löschen rechts */}
                <div className="flex justify-between items-center">
                  <h3 className="flex items-center text-brand-teal font-semibold text-lg h-12">
                    Schritt {index + 1}
                  </h3>

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeInstruction(index)}
                    className="flex items-center gap-1.5 text-xs h-8 px-2"
                  >
                    <Trash size={16} weight="regular" /> Schritt löschen
                  </Button>
                </div>

                {/* Das Textfeld */}
                <Textarea
                  {...register(`instructions.${index}.text`, { required: true })}
                  className="w-full max-w-full min-h-[140px] max-h-[calc(100dvh-200px)] [field-sizing:content] overflow-y-auto break-all text-base leading-relaxed border-gray-200 rounded-xl focus-visible:ring-teal-500 bg-white resize-none p-4 shadow-sm"
                  placeholder="Beschreibe, was in diesem Schritt passiert..."
                />
              </div>
            ))}

            {/* Button zum Hinzufügen (Ganz unten) */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => appendInstruction({ step: instructionFields.length + 1, text: "" })}
              className="flex items-center gap-2 font-medium mt-2"
            >
              <Plus size={20} weight="bold" /> Schritt hinzufügen
            </Button>

            {/* Platzhalter unten, damit der Footer nichts verdeckt beim Scrollen */}
            <div className="h-4"></div>
          </div>
        )}

      </div>

      {/* --- FOOTER --- */}
      <div className="flex-none p-4 bg-white border-t border-border-default flex justify-between items-center z-20">
        <Button
          variant="ghost"
          onClick={prevStep}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} weight="bold" />
          {step === 1 ? "Abbrechen" : "Zurück"}
        </Button>

        {step < 5 ? (
          <Button
            variant="primary"
            onClick={step === 1 ? handleImport : nextStep}
            disabled={step === 1 && !importUrl}
            className="flex items-center gap-2"
          >
            {step === 1 ? "Import" : "Weiter"} <ArrowRight size={16} weight="bold" />
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            className="flex items-center gap-2"
          >
            Fertigstellen <Check size={16} weight="bold" />
          </Button>
        )}
      </div>

    </div>
  );
}