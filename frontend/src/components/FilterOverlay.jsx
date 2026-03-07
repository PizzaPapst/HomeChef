import React, { useState, useEffect } from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import { CardIconButton } from "./ui/CardIconButton";
import { cn } from "@/lib/utils";

const FilterOverlay = ({ isOpen, onClose, title, children, showSearch = false, searchValue = "", onSearchChange }) => {
    const [shouldRender, setShouldRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) setShouldRender(true);
    }, [isOpen]);

    const handleAnimationEnd = () => {
        if (!isOpen) setShouldRender(false);
    };

    if (!shouldRender) return null;

    return (
        <div
            className={cn(
                "fixed inset-0 z-[110] transition-opacity duration-300",
                isOpen ? "bg-black/20 opacity-100" : "bg-black/0 opacity-0 pointer-events-none"
            )}
            onClick={onClose}
        >
            <div
                className={cn(
                    "absolute inset-0 bg-custom-bg flex flex-col pt-6 px-4 shadow-2xl transition-transform duration-300 ease-out",
                    isOpen ? "translate-y-0" : "translate-y-full"
                )}
                onClick={(e) => e.stopPropagation()}
                onTransitionEnd={handleAnimationEnd}
            >
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <CardIconButton onClick={onClose}>
                        <ArrowLeft size={20} weight="bold" />
                    </CardIconButton>

                    {showSearch ? (
                        <div className="relative flex-1">
                            <input
                                type="text"
                                className="w-full h-14 bg-white border border-border rounded-xl px-4 text-text-default placeholder:text-text-subinfo focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
                                placeholder="Zutaten durchsuchen"
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>
                    ) : (
                        <h2 className="text-xl font-semibold text-text-default">{title}</h2>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto pb-10">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default FilterOverlay;
