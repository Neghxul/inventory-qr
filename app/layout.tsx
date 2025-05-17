import Footer from "@/components/Footer";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { ReactNode } from "react";

export const metadata = {
  title: "QR & Inventory App",
  description: "Professional code scanner and inventory sessions",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">
        <NavBar />
        <main className="p-4 max-w-7xl mx-auto">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
