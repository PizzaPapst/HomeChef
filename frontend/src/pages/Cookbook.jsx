import { Link } from "react-router-dom";

export default function Cookbook() {
  return (
    <div className="p-6 pt-12">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mein Kochbuch 🍲</h1>
      
      {/* Zum Testen: Ein Link zu Rezept Nr. 1 */}
      <Link to="/recipe/1">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="h-16 w-16 bg-gray-200 rounded-lg overflow-hidden">
             <img src="https://images.unsplash.com/photo-1543353071-087092ec393a?q=80&w=200" className="w-full h-full object-cover"/>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Chili con Carne</h3>
            <span className="text-teal-600 text-sm font-medium">Zum Rezept →</span>
          </div>
        </div>
      </Link>

    </div>
  )
}