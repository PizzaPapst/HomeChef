import React from 'react';
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { CaretDown } from "@phosphor-icons/react";

const pillVariants = cva(
    "flex items-center gap-2 px-4 py-2 text-text-default text-sm min-h-12 whitespace-nowrap transition-colors bg-alternative-bg",
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


const Pill = ({ children, icon = true, className, variant, onClick, ...props }) => {
    return (
        <button
            className={cn(pillVariants({ variant, className }))}
            onClick={onClick}
            {...props}
        >
            {children}
            {icon && <CaretDown size={16} />}
        </button>
    );
};

export { Pill, pillVariants };
