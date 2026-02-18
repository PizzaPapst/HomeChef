import { Link } from "react-router-dom";

export function TextLink({ to, children, className = "" }) {
    return (
        <Link
            to={to}
            className={`text-brand-teal underline text-[18px] font-normal transition-colors hover:text-brand-teal/80 ${className}`}
        >
            {children}
        </Link>
    );
}
