import { useState, useEffect } from 'react'
import { fetchAllRecipes } from './services/api'
import './App.css'

function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Wird beim Starten der Komponente ausgeführt
  useEffect(() => {
    // Da useEffect nicht direkt async sein darf, bauen wir eine Hilfsfunktion
    const loadData = async () => {
      const data = await fetchAllRecipes();
      setRecipes(data);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) return <p>Lade Rezepte...</p>;

  return (
    <div className="container">
      <h1>Meine Rezepte 🍲</h1>
      
      {recipes.length === 0 ? (
        <p>Noch keine Rezepte vorhanden.</p>
      ) : (
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <div key={recipe.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px', borderRadius: '8px' }}>
              {recipe.imageUrl && (
                <img src={recipe.imageUrl} alt={recipe.title} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px' }} />
              )}
              <h3>{recipe.title}</h3>
              <p>⏳ {recipe.prepTime ? recipe.prepTime + ' Min.' : '?'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App