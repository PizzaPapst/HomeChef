import { Link } from "react-router-dom";
import { RecipeCard } from "../components/RecipeCard";

export default function Cookbook() {
  return (
    <div className="flex flex-1 flex-col gap-1">

      <div className="p-4 h-[76px]"></div>

      <div className="bg-custom-bg flex flex-colum flex-1 gap-2 px-4 pt-6 pb-4 rounded-t-3xl">
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-lg">Vorschlag des Tages</h2>
          <RecipeCard recipe={""}/>

        </div>

      </div>
      
      

    </div>
  )
}