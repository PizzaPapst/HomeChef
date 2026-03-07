import React from 'react'
import { MagnifyingGlass, ArrowLeft } from "@phosphor-icons/react";
import { cn } from '../../lib/utils'
import { useNavigate } from 'react-router-dom'

const Searchbar = React.forwardRef(({
    variant = 'default',
    placeholder = "Rezept suchen",
    className,
    icon: Icon = MagnifyingGlass,
    ...props
}, ref) => {

    const navigate = useNavigate();

    const variants = {
        default: "flex items-center justify-start gap-2 w-full h-14 px-6 bg-white border border-border-default rounded-full shadow-sm",
        minimal: "bg-transparent rounded-none h-14 px-6 w-full",
    }

    const button = (
        <button
            className={cn(
                "flex items-center justify-center gap-2 w-full h-14 px-6 bg-white border border-border-default rounded-full shadow-sm",
                className
            )}
            onClick={() => navigate("/search")}
        >
            <MagnifyingGlass size={20} weight="bold" className="text-text-subinfo" />
            <span className="text-text-subinfo text-base font-normal">{placeholder}</span>
        </button>
    )

    const searchbar = (
        <div className={cn(
            "relative flex items-center w-full min-h-14 transition-all duration-200 group",
            variants[variant] || variants.default,
            className
        )}>
            {variant === 'default' && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate("/");
                    }}
                    className="mr-2 p-1 rounded-full hover:bg-bg-light-gray transition-colors shrink-0"
                >
                    <ArrowLeft size={20} weight="bold" className="text-text-default" />
                </button>
            )}
            <input
                ref={ref}
                type="text"
                placeholder={placeholder}
                className="flex-1 bg-transparent border-none outline-none text-text-default placeholder:text-text-subinfo/60 text-base py-3"
                {...props}
            />
        </div>
    )

    if (variant === "button") {
        return button
    } else {
        return searchbar
    }

})

export default Searchbar