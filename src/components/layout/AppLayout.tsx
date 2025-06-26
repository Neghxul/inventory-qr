// src/components/layout/AppLayout.tsx
"use client";

import { useSession } from "next-auth/react";
import SideBar from "./SideBar";
import NavBar from "./NavBar";
import { FiLoader } from "react-icons/fi";
import { SidebarProvider } from "@/lib/context/SidebarContext"; // <-- Importa el provider

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <FiLoader className="animate-spin text-blue-500 h-12 w-12" />
      </div>
    );
  }

  // El AppLayout ahora solo se renderiza para usuarios autenticados
  if (status === "unauthenticated") {
    return <>{children}</>;
  }

  return (
    <SidebarProvider> {/* <-- Envuelve aquí */}
      <div className="flex">
        <SideBar />
        <div className="flex-1 flex flex-col h-screen">
          <NavBar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}