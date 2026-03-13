import React from 'react';
import { cn } from "@/lib/utils";

export const Header = ({ className, children, ...props }) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-[72px] w-full items-center justify-between bg-white px-4 shadow-header-shadow",
        className
      )}
      {...props}
    >
      {children}
    </header>
  );
};

export default Header;
