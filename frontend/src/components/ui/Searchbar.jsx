import React from 'react'
import { MagnifyingGlass, ArrowLeft } from "@phosphor-icons/react";
import { cn } from '../../lib/utils'
import { useNavigate } from 'react-router-dom'

const Searchbar = React.forwardRef(({
    placeholder,
    className,
    value,
    filterCount = 0,
    icon: Icon = MagnifyingGlass,
    variant = 'default',
    ...props
}, ref) => {

    const navigate = useNavigate();

    if (variant === "button") {
        return (
            <button
                className={cn(
                    "flex gap-2 w-full min-h-12 items-center px-6 bg-white border border-border-default rounded-full",
                    className
                )}
                onClick={props.onClick || (() => navigate("/search"))}
            >

                <MagnifyingGlass size={20} weight="bold" className="text-text-subinfo shrink-0" />

                <span className={cn(
                    "text-base font-normal truncate flex-1 text-left",
                    (value && value.trim() !== "") ? "text-text-default" : "text-text-subinfo"
                )}>
                    {value || placeholder || "Leere Suche"}
                </span>

                {filterCount > 0 && (
                    <span className="text-text-subinfo text-sm font-medium shrink-0">+{filterCount}</span>
                )}
            </button>
        )
    }

    return (
        <div className={cn(
            "flex items-center w-full min-h-12 px-6 bg-white border border-border-default rounded-full",
            className
        )}>
            <Icon size={20} weight="bold" className="text-text-subinfo shrink-0 mr-2" />
            <input
                ref={ref}
                type="text"
                value={value}
                placeholder={placeholder}
                className="flex-1 bg-transparent border-none outline-none text-text-default placeholder:text-text-subinfo/60 text-base py-3"
                {...props}
            />
        </div>
    )
})

export default Searchbar
