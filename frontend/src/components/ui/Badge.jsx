import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-[20px] px-3 py-1.5 text-xs font-semibold font-['Poppins'] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "bg-brand-teal text-white",
                brand: "bg-brand-teal text-white",
                glass: "bg-white/90 text-text-default",
                outline: "border border-border-default text-text-label bg-transparent",
                secondary: "bg-alternative-bg text-text-label",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

function Badge({
    className,
    variant,
    ...props
}) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
