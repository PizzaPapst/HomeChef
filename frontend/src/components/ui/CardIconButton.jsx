import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardIconButtonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-[36px] w-[36px] bg-white/90 border-none hover:bg-brand-teal-10 active:bg-brand-teal-20",
    {
        variants: {
            variant: {
                default: "",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

const CardIconButton = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
        <Comp
            className={cn(cardIconButtonVariants({ className }))}
            ref={ref}
            {...props} />
    )
})
CardIconButton.displayName = "CardIconButton"

export { CardIconButton, cardIconButtonVariants }
