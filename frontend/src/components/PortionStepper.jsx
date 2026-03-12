import { IconButton } from "@/components/ui/IconButton";
import { Minus, Plus } from "@phosphor-icons/react";

export function PortionStepper({ servings, onUpdate }) {
  return (
    <div className="flex items-center justify-between bg-bg-light-gray pl-4 pr-2 py-2 rounded-lg">
      <span className="flex">
        Für <span className="font-semibold w-[36px] flex justify-center">{servings}</span> Portionen
      </span>

      <div className="flex items-center">
        <IconButton
          variant="standalone"
          onClick={() => onUpdate(Math.max(1, servings - 1))}
          disabled={servings <= 1}
        >
          <Minus size={20} weight="bold" />
        </IconButton>

        <IconButton
          variant="standalone"
          onClick={() => onUpdate(servings + 1)}
        >
          <Plus size={20} weight="bold" />
        </IconButton>
      </div>
    </div>
  );
}