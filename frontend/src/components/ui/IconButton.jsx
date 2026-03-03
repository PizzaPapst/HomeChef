import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const iconButtonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-[56px] w-[56px] group",
    {
        variants: {
            variant: {
                standalone: "",
                floating: "",
                ghost: "",
            },
        },
        defaultVariants: {
            variant: "standalone",
        },
    }
)

const IconButton = React.forwardRef(({ className, variant, children, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    // Determine inner styles based on variant
    const innerStyles = cn(
        "w-[44px] h-[44px] flex items-center justify-center rounded-full transition-colors",
        variant === "standalone" && "bg-white border border-border group-hover:bg-brand-teal-10 group-active:bg-brand-teal-20",
        variant === "floating" && "bg-white/90 border-none shadow-nav-shadow group-hover:bg-white group-active:bg-brand-teal-20",
        variant === "ghost" && "bg-transparent border-none group-hover:bg-black/5 group-active:bg-black/10"
    );

    return (
        <Comp
            className={cn(iconButtonVariants({ variant, className }))}
            ref={ref}
            {...props}
        >
            <div className={innerStyles}>
                {children}
            </div>
        </Comp>
    )
})
IconButton.displayName = "IconButton"

export { IconButton, iconButtonVariants }
