// src/components/layout/SideBar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, Fragment, useContext } from "react";
import { useSession } from "next-auth/react";
import {
  FiHome, FiLayers, FiPlusCircle, FiRadio, FiChevronsLeft,
  FiChevronsRight, FiGrid, FiTool, FiShield, FiUsers, FiChevronDown, FiBriefcase,
  FiEdit3
} from "react-icons/fi";
import { Role } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, Transition, Portal } from '@headlessui/react';
import { SidebarContext } from '@/lib/context/SidebarContext';
import {
    useFloating,
    useHover,
    useInteractions,
    useDismiss,
    offset,
    flip,
    shift
} from '@floating-ui/react';

type NavItem = { href: string; label: string; icon: React.ElementType; };
type NavSection = { label: string; icon: React.ElementType; items: NavItem[]; adminOnly?: boolean; };

// 1. Unificamos la definición de la navegación
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
  { label: "CRM", icon: FiBriefcase, items: [
      { href: "/crm/companies", label: "Companies", icon: FiBriefcase },
      { href: "/crm/contacts", label: "Contacts", icon: FiUsers }, 
  ]},
  { label: "Designer", icon: FiEdit3, items: [
      { href: "/designer/templates/new", label: "New Template", icon: FiPlusCircle },
  ]},
  { label: "Admin", icon: FiShield, adminOnly: true, items: [
      { href: "/admin/users", label: "Manage Users", icon: FiUsers },
  ]},
];

export default function SideBar() {
  const { data: session, status } = useSession();
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useContext(SidebarContext);

  const userRole = session?.user?.role;
  const isAuthenticated = status === "authenticated";

  if (!isAuthenticated) return null;

  const filteredNavSections = navSections.filter(section => 
    !section.adminOnly || (section.adminOnly && userRole === Role.ADMIN)
  );

  return (
    <> 
      {/* Overlay para móvil */}
      <div 
        onClick={() => setIsMobileOpen(false)} 
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      <aside
        className={`bg-gray-900 text-white h-screen p-4 flex flex-col fixed md:sticky top-0 z-40 transition-transform duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {/* Header del Sidebar */}
        <div className="flex items-center justify-between mb-8">
          {!isCollapsed && <Link href="/" className="text-lg font-bold">QR & Inventory</Link>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-gray-800 rounded-full hidden md:block">
            {isCollapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
          </button>
        </div>

        {/* 2. Separamos el renderizado de la navegación */}
        {isCollapsed 
          ? <CollapsedNav sections={filteredNavSections} /> 
          : <ExpandedNav sections={filteredNavSections} />
        }
      </aside>
    </>
  );
}

// ==================================
// Componente para el Menú Expandido (Acordeón)
// ==================================
const ExpandedNav = ({ sections }: { sections: NavSection[] }) => {
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<string | null>(() => {
    const currentSection = sections.find(s => s.items.some(i => pathname.startsWith(i.href) && i.href !== '/'));
    return currentSection?.label || (pathname === '/' ? 'General' : null);
  });
  
  return (
    <nav className="flex-1 overflow-y-auto">
      <ul className="space-y-2">
        {sections.map((section) => {
          const isOpen = openSection === section.label;
          return (
            <li key={section.label}>
              <button onClick={() => setOpenSection(isOpen ? null : section.label)} className="w-full flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-gray-800">
                <div className="flex items-center gap-3">
                  <section.icon className="h-5 w-5 flex-shrink-0 text-gray-400" />
                  <span className="font-semibold">{section.label}</span>
                </div>
                <FiChevronDown className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.ul initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="ml-4 pl-3 mt-1 overflow-hidden border-l border-gray-700">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} className={`flex items-center gap-3 my-1 p-2 rounded-lg text-sm transition-colors ${pathname === item.href ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300'}`}>
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
  );
};

// ==================================
// Componente para el Menú Colapsado (Flyout)
// ==================================
const CollapsedNav = ({ sections }: { sections: NavSection[] }) => {
    return (
        <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-2">
                {sections.map((section) => (
                    // Creamos un componente por cada item para manejar su propio estado de posicionamiento
                    <FlyoutMenuItem key={section.label} section={section} />
                ))}
            </ul>
        </nav>
    );
};

// Componente individual para cada ítem del menú colapsado
const FlyoutMenuItem = ({ section }: { section: NavSection }) => {
    const [isOpen, setIsOpen] = useState(false);
    

    // 1. Configuración de Floating UI
    const { x, y, refs, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        placement: 'right-start', // Posición inicial
        middleware: [
            offset(12), // Separación de 12px del icono
            flip(),     // Si no hay espacio, volteará al otro lado
            shift(),    // Se asegura de que permanezca en la pantalla
        ],
    });

    // 2. Interacciones (abrir al pasar el ratón)
    const hover = useHover(context, 
      { move: false,
        delay: {
            open: 150,
            close: 100,
        },
    });
    const dismiss = useDismiss(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([
        hover,
        dismiss,
    ]);

    return (
        <li>
            {/* 3. Asignamos la referencia al botón */}
            <div ref={refs.setReference} {...getReferenceProps()}>
                <button className={`w-full flex justify-center p-3 rounded-lg focus:outline-none transition-colors ${isOpen ? 'bg-gray-700' : 'hover:bg-gray-800'}`}>
                    <section.icon className="h-6 w-6 text-gray-400" />
                </button>
            </div>

            <Transition
                as={Fragment}
                show={isOpen}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-x-[-10px]"
                enterTo="opacity-100 translate-x-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-x-0"
                leaveTo="opacity-0 translate-x-[-10px]"
            >
                {/* El Portal sigue siendo necesario */}
                <Portal>
                    {/* 4. Asignamos la referencia y los estilos al panel */}
                    <div
                        ref={refs.setFloating}
                        style={{
                            position: 'absolute',
                            top: y ?? 0,
                            left: x ?? 0,
                            width: 'max-content',
                        }}
                        {...getFloatingProps()}
                        className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50"
                    >
                       <div className="p-2 w-56">
                            <p className="px-2 py-1 font-bold text-white">{section.label}</p>
                            <hr className="border-gray-700 my-1"/>
                            {section.items.map(item => (
                                <Link key={item.href} href={item.href} className="flex w-full items-center gap-3 p-2 rounded-md text-sm hover:bg-blue-600 text-white transition-colors">
                                    <item.icon className="h-5 w-5"/>
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </Portal>
            </Transition>
        </li>
    );
}