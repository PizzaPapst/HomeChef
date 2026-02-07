import { NavLink } from "react-router-dom";
import { Book, CalendarBlank } from "@phosphor-icons/react";

// 1. Wir lagern die komplexe Logik in eine eigene Komponente aus
function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 transition-all w-full ${
          isActive ? "text-brand-teal" : "text-text-default"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={`px-4 py-1 rounded-full ${
              isActive ? "bg-teal-light" : "bg-transparent"
            }`}
          >
            {/* Wir rendern das übergebene Icon dynamisch */}
            <Icon
              size={24}
              weight={isActive ? "fill" : "regular"}
              className={isActive ? "text-brand-teal" : "text-text-default"}
            />
          </div>
          <span className={`text-xs ${isActive ? "font-semibold" : "font-medium"}`}>{label}</span>
        </>
      )}
    </NavLink>
  );
}

// 2. Deine eigentliche Navigation ist jetzt extrem sauber:
export function MobileNavigation() {
  return (
    <nav className="w-full bg-white border-t-2 border-border-default px-6 py-4 flex justify-between items-center">
      
      <NavItem 
        to="/" 
        icon={Book} 
        label="Kochbuch" 
      />

      <NavItem 
        to="/plan" 
        icon={CalendarBlank} 
        label="Wochenplan" 
      />

    </nav>
  );
}