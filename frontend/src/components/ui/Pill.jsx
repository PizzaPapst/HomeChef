import React from 'react';
import { cn } from "@/lib/utils";

const Pill = ({ children, icon: Icon, className, onClick, ...props }) => {
    return (
        <button
            className={cn(
                "flex items-center gap-2 px-4 py-3 bg-alternative-bg rounded-xl text-text-label font-medium whitespace-nowrap hover:bg-border-default transition-colors",
                className
            )}
            onClick={onClick}
            {...props}
        >
            {children}
            {Icon && <Icon size={16} />}
        </button>
    );
};

export { Pill };
