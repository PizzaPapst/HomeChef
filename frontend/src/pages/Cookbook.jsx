import { Link } from "react-router-dom";

export default function Cookbook() {
  return (
    <div className="flex flex-1 flex-col gap-1">

      <div className="p-4 h-[76px]"></div>

      <div className="bg-custom-bg flex flex-colum flex-1 gap-2 px-4 pt-6 pb-4 rounded-t-3xl">
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-lg">Vorschlag des Tages</h2>
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

      </div>
      
      

    </div>
  )
}