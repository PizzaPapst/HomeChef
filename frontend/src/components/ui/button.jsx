import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-12 px-6",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-teal text-text-inverted shadow-sm hover:bg-brand-teal/90 border-none",
        default:
          "bg-white text-text-default border border-border-default shadow-sm hover:bg-bg-light-gray",
        ghost:
          "bg-transparent text-text-default hover:bg-bg-light-gray border-none",
        destructive:
          "bg-transparent text-red-500 hover:bg-red-50 border-none font-semibold",
      },
      size: {
        default: "h-12 px-6",
        sm: "h-10 px-4",
        icon: "h-12 w-12 px-0",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
