import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react"
import { DateRangePicker } from "@/components/DateRangePicker";

export default function WeeklyPlan() {

  const navigate = useNavigate();


  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold ">Wochenplan</h1>

      <Button
              size="icon"
              className="fixed bottom-24 right-4 h-[80px] w-[80px] rounded-full shadow-xl z-50 transition-transform active:scale-95 shadow-fab-shadow text-text-inverted bg-brand-orange"
              onClick={() => navigate("/plan/create")}
      >
              <Plus size={28} weight="bold"/>
              <span className="sr-only">Neues Rezept erstellen</span>
      </Button>
    </div>
  )
}