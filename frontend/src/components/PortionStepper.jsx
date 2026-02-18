import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "@phosphor-icons/react";

export function PortionStepper({ servings, onUpdate }) {

  const tealColor = "text-brand-teal";

  return (
    <div className="flex items-center justify-between bg-alternative-bg px-4 py-2 rounded-lg">
      <span className="flex">
        Für <span className="font-semibold w-[36px] flex justify-center">{servings}</span> Portionen
      </span>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-brand-teal bg-white"
          onClick={() => onUpdate(servings - 1)}
          disabled={servings <= 1}
        >
          <Minus size={24} weight="bold" className={tealColor} />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-brand-teal bg-white"
          onClick={() => onUpdate(servings + 1)}
        >
          <Plus size={24} weight="bold" className={tealColor} />
        </Button>
      </div>
    </div>
  );
}