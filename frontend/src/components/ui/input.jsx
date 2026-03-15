import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, endAdornment, ...props }, ref) => {
  return (
    <div className={cn(
      "flex items-center w-full h-[56px] px-[16px] rounded-[4px] bg-white border border-border-default focus-within:ring-1 focus-within:ring-brand-teal transition-colors",
      className
    )}>
      <input
        type={type}
        className="flex-1 w-full h-full bg-transparent text-base placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        ref={ref}
        {...props}
      />
      {endAdornment && (
        <div className="flex flex-shrink-0 items-center justify-center text-text-subinfo">
          {endAdornment}
        </div>
      )}
    </div>
  );
})
Input.displayName = "Input"

export { Input }
