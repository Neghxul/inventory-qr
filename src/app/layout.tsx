// src/app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/Providers";
import AppLayout from "@/components/layout/AppLayout"; // <-- Importa el nuevo layout
import Script from "next/script";

export const metadata: Metadata = {
  title: "QR & Inventory App",
  description: "Professional code scanner and inventory sessions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">
        <Providers>
          {/* Ahora el AppLayout maneja la lógica de carga y sesión */}
          <AppLayout>{children}</AppLayout>
        </Providers>
        {/* SDK de Zebra Browser Print */}
        {/*<Script 
          src="http://127.0.0.1:9100/js/zebra/browserprint.js" 
          strategy="beforeInteractive"
        />*/}
      </body>
    </html>
  );
}