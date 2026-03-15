import React from 'react'
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RecipeWizard from "./RecipeWizard"; 

import { fetchRecipeById } from "@/services/api";

function EditRecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchRecipeById(id)
      .then((data) => {
        if (!data) throw new Error("Rezept nicht gefunden");
        setRecipe(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Konnte Rezeptdaten nicht laden.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        {/* Lade-Indikator */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-info-error mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="underline">Zurück</button>
      </div>
    );
  }

  // Hier ist der Trick: Wir übergeben die geladenen Daten als initialData!
  return <RecipeWizard initialData={recipe} />;
}

export default EditRecipePage