// Wir holen die URL aus der Konfiguration
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Holt alle Rezepte vom Backend.
 * @returns {Promise<Array>} Eine Liste von Rezepten.
 */
export async function fetchAllRecipes() {
  try {
    const response = await fetch(`${API_URL}/recipes`);
    
    if (!response.ok) {
      throw new Error('Fehler beim Laden der Rezepte');
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("API Fehler:", error);
    return []; // Leeres Array zurückgeben, damit die App nicht abstürzt
  }
}

/**
 * Holt ein einzelnes Rezept anhand der ID.
 * @param {string|number} id Die ID des Rezepts
 */
export async function fetchRecipeById(id) {
  try {
    const response = await fetch(`${API_URL}/recipes/${id}`);
    if (!response.ok) throw new Error('Rezept nicht gefunden');
    return await response.json();
  } catch (error) {
    console.error("API Fehler:", error);
    return null;
  }
}

// src/services/api.js
// ... deine fetchAllRecipes Funktion ...

export async function saveWeeklyPlan(payload) {
  const response = await fetch(`${API_URL}/meal-plans/week`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Fehler beim Speichern des Wochenplans");
  }

  return response.json();
}

export async function getWeeklyPlan(startDate, endDate) {
  // Wir wandeln die Dates in ISO-Strings um für das Backend
  const params = new URLSearchParams({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  const response = await fetch(`${API_URL}/meal-plans/week?${params}`);

  if (!response.ok) {
    throw new Error("Fehler beim Laden des Wochenplans");
  }

  return response.json();
}

export async function getAllMealPlans() {
  const response = await fetch(`${API_URL}/meal-plans/all`);
  if (!response.ok) throw new Error("Fehler beim Laden");
  return response.json();
}