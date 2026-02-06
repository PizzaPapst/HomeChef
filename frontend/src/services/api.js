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