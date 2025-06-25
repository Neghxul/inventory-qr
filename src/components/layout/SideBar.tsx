// src/components/layout/SideBar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  FiHome, FiLayers, FiPlusCircle, FiRadio, FiChevronsLeft,
  FiChevronsRight, FiGrid, FiTool, FiShield, FiUsers, FiChevronDown
} from "react-icons/fi";
import { Role } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";

// Definimos la estructura de nuestros items de navegación
type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

type NavSection = {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
  adminOnly?: boolean;
};

const navSections: NavSection[] = [
  { label: "General", icon: FiHome, items: [
      { href: "/", label: "Home", icon: FiHome },
      { href: "/scanner", label: "Scanner", icon: FiRadio },
  ]},
  { label: "Inventory", icon: FiLayers, items: [
      { href: "/inventory", label: "Sessions", icon: FiLayers },
      { href: "/inventory/new", label: "New Session", icon: FiPlusCircle },
  ]},
  { label: "Generators", icon: FiGrid, items: [
      { href: "/generator/qr", label: "QR Codes", icon: FiGrid },
      { href: "/generator/barcode", label: "Barcodes", icon: FiTool },
      { href: "/generator/batch", label: "Batch", icon: FiLayers },
  ]},
  { label: "Admin", icon: FiShield, adminOnly: true, items: [
      { href: "/admin/users/new", label: "Create User", icon: FiUsers },
  ]},
];

const adminNavItems: NavSection[] = [ // <-- Cambiamos el tipo para que coincida
  { 
    label: "Admin", 
    icon: FiShield, 
    adminOnly: true, // Mantenemos esta propiedad
    items: [
      { href: "/admin/users", label: "Manage Users", icon: FiUsers }, // <-- Enlace principal a la lista
      { href: "/admin/users/new", label: "Create User", icon: FiPlusCircle },
    ]
  },
];


export default function SideBar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(pathname.split('/')[1] || "General");

  const isAuthenticated = status === "authenticated";
  const userRole = session?.user?.role;

  if (!isAuthenticated) return null;

  return (
    <aside
      className={`bg-gray-900 text-white h-screen p-4 flex flex-col transition-all duration-300 sticky top-0 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header del Sidebar */}
      <div className="flex items-center justify-between mb-8">
        {!isCollapsed && <Link href="/" className="text-lg font-bold">QR & Inventory</Link>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-gray-800 rounded-full">
          {isCollapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {navSections.map((section) => {
            if (section.adminOnly && userRole !== Role.ADMIN) {
              return null;
            }

            const isOpen = openSection === section.label;

            return (
              <li key={section.label}>
                {/* Botón del Acordeón */}
                <button
                  onClick={() => setOpenSection(isOpen ? null : section.label)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-gray-800 ${isCollapsed && "justify-center"}`}
                >
                  <div className="flex items-center gap-3">
                    <section.icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-semibold">{section.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <FiChevronDown className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  )}
                </button>
                
                {/* Submenú Desplegable */}
                <AnimatePresence>
                  {isOpen && !isCollapsed && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="ml-4 mt-1 overflow-hidden"
                    >
                      {section.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${
                              pathname === item.href
                                ? "bg-blue-600/50 text-white"
                                : "hover:bg-gray-800/50 text-gray-300"
                            }`}
                          >
                            <span className="w-5 h-5 flex items-center justify-center">-</span>
                            <span>{item.label}</span>
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}