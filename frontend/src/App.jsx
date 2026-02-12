import { Routes, Route, useLocation } from "react-router-dom"; // useLocation importieren
import Cookbook from "./pages/Cookbook";
import WeeklyPlan from "./pages/WeeklyPlan";
import RecipeDetail from "./pages/RecipeDetail"; // Importieren
import RecipeWizard from "./pages/RecipeWizard"; // Importieren
import { MobileNavigation } from "./components/MobileNavigation";

function App() {
  const location = useLocation();

  // Liste der Seiten, auf denen die Navigation sichtbar sein soll
  // Alles andere (wie /recipe/123) hat KEINE Navigation.
  const showNavRoutes = ["/", "/plan"];

  // Prüfen, ob der aktuelle Pfad in der Liste ist
  const shouldShowNav = showNavRoutes.includes(location.pathname);

  return (
    // pb-24 (Padding unten) brauchen wir nur, wenn die Nav da ist, sonst stört der Platz
    <div className={`bg-brand-teal min-h-screen font-sans flex flex-col`}>
      
      <Routes>
        <Route path="/" element={<Cookbook />} />
        <Route path="/plan" element={<WeeklyPlan />} />
        
        {/* Der Doppelpunkt :id ist ein Platzhalter für irgendeine Nummer */}
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/recipe/create" element={<RecipeWizard />} />
      </Routes>

      {/* Bedingtes Rendern: Nur anzeigen wenn true */}
      {shouldShowNav && <MobileNavigation />}
      
    </div>
  )
}

export default App