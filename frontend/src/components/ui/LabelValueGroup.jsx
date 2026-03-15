import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

export function LabelValueGroup({ label, children, className }) {
  return (
    <div className={cn("flex flex-col gap-[2px]", className)}>
      {label && (
        <Label className="text-sm font-medium text-text-label">
          {label}
        </Label>
      )}
      {children}
    </div>
  )
}
