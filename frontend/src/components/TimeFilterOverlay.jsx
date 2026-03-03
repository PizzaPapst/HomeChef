import React from 'react';
import { Pill } from "./ui/Pill";
import { cn } from "@/lib/utils";

const timeOptions = [
    { label: "Alle", value: null },
    { label: "Bis 15 min", value: 15 },
    { label: "Bis 30 min", value: 30 },
    { label: "Bis 45 min", value: 45 },
    { label: "Über 45 min", value: 46 },
];

const TimeFilterOverlay = ({ selectedTime, onSelect }) => {
    return (
        <div className="flex flex-col gap-6">
            <button
                onClick={() => onSelect(null)}
                className="text-brand-teal font-semibold text-sm self-start hover:underline"
            >
                Filter zurücksetzen
            </button>
            <div className="flex flex-wrap gap-3">
                {timeOptions.map((option) => (
                    <Pill
                        key={option.label}
                        className={cn(
                            "h-12 px-6",
                            selectedTime === option.value && "bg-brand-teal text-white hover:bg-brand-teal/90"
                        )}
                        onClick={() => onSelect(option.value)}
                    >
                        {option.label}
                    </Pill>
                ))}
            </div>
        </div>
    );
};

export default TimeFilterOverlay;
