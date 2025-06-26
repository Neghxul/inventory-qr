// src/lib/context/SidebarContext.tsx
"use client";

import { createContext, useState, ReactNode } from 'react';

interface SidebarContextType {
    isCollapsed: boolean;
    setIsCollapsed: (isCollapsed: boolean) => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (isOpen: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextType>({
    isCollapsed: false,
    setIsCollapsed: () => {},
    isMobileOpen: false,
    setIsMobileOpen: () => {},
});

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }}>
            {children}
        </SidebarContext.Provider>
    );
};