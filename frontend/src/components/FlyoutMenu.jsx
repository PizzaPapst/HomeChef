import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function FlyoutMenu({ trigger, items, className }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                {trigger}
            </PopoverTrigger>
            <PopoverContent
                align="end"
                sideOffset={8}
                className={cn(
                    "w-48 p-1 bg-white border-0 rounded-[8px] shadow-lg animate-in fade-in zoom-in-95 duration-100",
                    className
                )}
            >
                <div className="flex flex-col">
                    {items.map((item, index) => (
                        <button
                            key={index}
                            onClick={item.onClick}
                            className={cn(
                                "flex w-full items-center px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-50 text-left first:rounded-t-[8px] last:rounded-b-[8px]",
                                item.className
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}
