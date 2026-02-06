import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock } from "@phosphor-icons/react";

export default function RecipeDetail() {
  const { id } = useParams(); // Holt die ID aus der URL (z.B. "123")
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen pb-6">
      
      {/* HEADER BILD MIT ZURÜCK-BUTTON */}
      <div className="relative h-72 w-full">
        <img 
          src="https://images.unsplash.com/photo-1543353071-087092ec393a?q=80&w=1000&auto=format&fit=crop" 
          alt="Rezept Bild" 
          className="w-full h-full object-cover"
        />
        
        {/* Der Zurück-Button schwebt oben links über dem Bild */}
        <button 
          onClick={() => navigate(-1)} // Geht eine Seite zurück
          className="absolute top-6 left-6 bg-white/90 p-2 rounded-full shadow-sm active:scale-95 transition-transform"
        >
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
      </div>

      {/* INHALT */}
      <div className="px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-t-3xl p-6 shadow-sm min-h-[500px]">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div> {/* Kleiner "Griff" oben */}
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Rezept ID: {id}</h1>
          
          <div className="flex items-center text-gray-500 text-sm mb-6">
            <Clock size={18} className="mr-1" />
            <span>45 Min. • Einfach</span>
          </div>

          <p className="text-gray-600 leading-relaxed">
            Hier stehen dann später die leckeren Details, Zutaten und Schritte für dein Rezept. 
            Da wir hier tief im Detail sind, brauchen wir unten keine Navigation – der Fokus liegt voll auf dem Kochen! 🍳
          </p>
        </div>
      </div>

    </div>
  )
}