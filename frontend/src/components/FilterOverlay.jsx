import React, { useState, useEffect } from "react";
import { XIcon } from "@phosphor-icons/react";
import { IconButton } from "./ui/IconButton";
import Searchbar from "./ui/Searchbar";
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
                    "absolute inset-0 bg-bg-alternation flex flex-col shadow-2xl transition-transform duration-300 ease-out",
                    isOpen ? "translate-y-0" : "translate-y-full"
                )}
                onClick={(e) => e.stopPropagation()}
                onTransitionEnd={handleAnimationEnd}
            >
                {/* Header */}
                <div className="flex items-center p-4 bg-white border-b border-border-default">
                    <IconButton variant="ghost" onClick={onClose}>
                        <XIcon size={20} weight="bold" />
                    </IconButton>

                    {showSearch ? (
                        <Searchbar
                            variant="minimal"
                            placeholder="Zutaten durchsuchen"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="flex-1"
                        />
                    ) : (
                        <h2 className="text-base text-text-default">{title}</h2>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default FilterOverlay;
