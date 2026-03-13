import React from 'react';
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { CaretDown } from "@phosphor-icons/react";

const pillVariants = cva(
    "flex items-center gap-2 px-6 py-2 text-text-default text-sm min-h-12 whitespace-nowrap transition-colors bg-white border border-border-default",
    {
        variants: {
            variant: {
                default: "rounded-sm",
                rounded: "rounded-full",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);


const Pill = ({ children, icon = true, className, variant, onClick, active, ...props }) => {
    return (
        <button
            className={cn(
                pillVariants({ variant, className }),
                active && "bg-brand-teal text-text-inverted"
            )}
            onClick={onClick}
            {...props}
        >
            {children}
            {icon && <CaretDown size={16} />}
        </button>
    );
};

export { Pill, pillVariants };
