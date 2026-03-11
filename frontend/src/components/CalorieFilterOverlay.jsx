import React from 'react';
import { Pill } from "./ui/Pill";
import { cn } from "@/lib/utils";

const calorieOptions = [
    { label: "Alle", value: null },
    { label: "Bis 400 kcal", value: 400 },
    { label: "Bis 600 kcal", value: 600 },
    { label: "Bis 800 kcal", value: 800 },
    { label: "Über 800 kcal", value: 801 },
];

const CalorieFilterOverlay = ({ selectedCalories, onSelect }) => {
    return (
        <div className="flex flex-col gap-6">
            <button
                onClick={() => onSelect(null)}
                className="text-brand-teal font-semibold text-sm self-start hover:underline"
            >
                Filter zurücksetzen
            </button>
            <div className="flex flex-wrap gap-3">
                {calorieOptions.map((option) => (
                    <Pill
                        key={option.label}
                        icon={false}
                        active={selectedCalories === option.value}
                        onClick={() => onSelect(option.value)}
                    >
                        {option.label}
                    </Pill>
                ))}
            </div>
        </div>
    );
};

export default CalorieFilterOverlay;
