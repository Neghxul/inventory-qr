// src/app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Providers from "@/components/Providers";
import SideBar from "@/components/layout/SideBar";
import NavBar from "@/components/layout/NavBar"; // <-- Asegúrate que la ruta sea correcta

export const metadata: Metadata = {
  title: "QR & Inventory App",
  description: "Professional code scanner and inventory sessions",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">
        <Providers>
          <div className="flex">
            <SideBar />
            <div className="flex-1 flex flex-col h-screen">
              <NavBar />
              <main className="flex-1 overflow-y-auto p-4 md:p-8">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}