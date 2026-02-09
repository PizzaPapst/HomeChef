import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "@phosphor-icons/react";

export function PortionStepper({servings, onUpdate}) {

  const tealColor = "text-brand-teal";

  return (
    <div className="flex items-center justify-between bg-alternative-bg p-4 rounded-lg">
      <span className="flex">
        Für <span className="font-semibold w-[36px] flex justify-center">{servings}</span> Portionen
      </span>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-2xl border-brand-teal bg-white hover:bg-brand-teal/10 hover:border-brand-teal transition-colors"
          onClick={()=>onUpdate(servings-1)}
          disabled={servings <= 1}
        >
          <Minus size={28} weight="bold" className={tealColor} />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-2xl border-brand-teal bg-white hover:bg-brand-teal/10 hover:border-brand-teal transition-colors"
          onClick={()=>onUpdate(servings+1)}
        >
          <Plus size={28} weight="bold" className={tealColor} />
        </Button>
      </div>
    </div>
  );
}