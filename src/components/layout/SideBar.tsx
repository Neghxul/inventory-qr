// src/components/layout/SideBar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, Fragment, useContext } from "react";
import { useSession } from "next-auth/react";
import {
  FiHome, FiLayers, FiPlusCircle, FiRadio, FiChevronsLeft,
  FiChevronsRight, FiGrid, FiTool, FiShield, FiUsers, FiChevronDown, FiBriefcase,
  FiEdit3, FiShoppingCart, FiBarChart2
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
import { useTranslations } from "next-intl";

type NavItem = { href: string; label: string; icon: React.ElementType; };
type NavSection = { label: string; icon: React.ElementType; items: NavItem[]; adminOnly?: boolean; };

const navSections: NavSection[] = [
  { label: "general", icon: FiHome, items: [
      { href: "/", label: "home", icon: FiHome },
      { href: "/scanner", label: "scanner", icon: FiRadio },
  ]},
  { label: "inventory", icon: FiLayers, items: [
      { href: "/inventory", label: "sessions", icon: FiLayers },
      { href: "/inventory/new", label: "newSession", icon: FiPlusCircle },
  ]},
  { label: "generators", icon: FiGrid, items: [
      { href: "/generator/qr", label: "qrCodes", icon: FiGrid },
      { href: "/generator/barcode", label: "barcodes", icon: FiTool },
      { href: "/generator/batch", label: "batch", icon: FiLayers },
  ]},
  { label: "crm", icon: FiBriefcase, items: [
      { href: "/crm/dashboard", label: "dashboard", icon: FiBarChart2 },
      { href: "/crm/companies", label: "companies", icon: FiBriefcase },
      { href: "/crm/contacts", label: "contacts", icon: FiUsers }, 
      { href: "/crm/orders", label: "orders", icon: FiShoppingCart },
  ]},
  { label: "designer", icon: FiEdit3, items: [
      { href: "/designer/templates", label: "templates", icon: FiGrid }, 
      { href: "/designer/templates/new", label: "newTemplate", icon: FiPlusCircle },
  ]},
  { label: "admin", icon: FiShield, adminOnly: true, items: [
      { href: "/admin/users", label: "manageUsers", icon: FiUsers },
  ]},
];

export default function SideBar() {
  const t = useTranslations('SideBar');
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
      <div 
        onClick={() => setIsMobileOpen(false)} 
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      <aside
        className={`bg-gray-900 text-white h-screen pt-4 pb-4 pl-2 pr-2 flex flex-col fixed md:sticky top-0 z-40 transition-transform duration-300 ${
          isCollapsed ? "w-15" : "w-64"
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="flex items-center justify-between mb-8">
          {!isCollapsed && <Link href="/" className="text-lg font-bold">QR & Inventory</Link>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 hover:bg-gray-800 rounded-full hidden md:block">
            {isCollapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
          </button>
        </div>

        {isCollapsed 
          ? <CollapsedNav sections={filteredNavSections} /> 
          : <ExpandedNav sections={filteredNavSections} />
        }
      </aside>
    </>
  );
}

// ==================================
// Menú Expandido
// ==================================
const ExpandedNav = ({ sections }: { sections: NavSection[] }) => {
  const t = useTranslations('SideBar');
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<string | null>(() => {
    const currentSection = sections.find(s => s.items.some(i => pathname.startsWith(i.href) && i.href !== '/'));
    return currentSection?.label || (pathname === '/' ? 'general' : null);
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
                  <span className="font-semibold">{t(section.label)}</span>
                </div>
                <FiChevronDown className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.ul initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="ml-4 pl-3 mt-1 overflow-hidden border-l border-gray-700">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} className={`flex items-center gap-3 my-1 p-2 rounded-lg text-sm transition-colors ${pathname === item.href ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300'}`}>
                          <span>{t(item.label)}</span>
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
// Menú Colapsado
// ==================================
const CollapsedNav = ({ sections }: { sections: NavSection[] }) => {
    return (
        <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-2">
                {sections.map((section) => (
                    <FlyoutMenuItem key={section.label} section={section} />
                ))}
            </ul>
        </nav>
    );
};

const FlyoutMenuItem = ({ section }: { section: NavSection }) => {
    const t = useTranslations('SideBar');
    const [isOpen, setIsOpen] = useState(false);

    const { x, y, refs, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        placement: 'right-start',
        middleware: [offset(12), flip(), shift()],
    });

    const hover = useHover(context, { move: false, delay: { open: 150, close: 100 } });
    const dismiss = useDismiss(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([hover, dismiss]);

    return (
        <li>
            <div ref={refs.setReference} {...getReferenceProps()}>
                <button className={`w-full flex justify-center p-3 rounded-lg focus:outline-none transition-colors ${isOpen ? 'bg-gray-700' : 'hover:bg-gray-800'}`}>
                    <section.icon className="h-6 w-6 text-gray-400" />
                </button>
            </div>

            <Transition as={Fragment} show={isOpen} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-x-[-10px]" enterTo="opacity-100 translate-x-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-x-0" leaveTo="opacity-0 translate-x-[-10px]">
                <Portal>
                    <div ref={refs.setFloating} style={{ position: 'absolute', top: y ?? 0, left: x ?? 0, width: 'max-content' }} {...getFloatingProps()} className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                       <div className="p-2 w-56">
                            <p className="px-2 py-1 font-bold text-white">{t(section.label)}</p>
                            <hr className="border-gray-700 my-1"/>
                            {section.items.map(item => (
                                <Link key={item.href} href={item.href} className="flex w-full items-center gap-3 p-2 rounded-md text-sm hover:bg-blue-600 text-white transition-colors">
                                    <item.icon className="h-5 w-5"/>
                                    {t(item.label)}
                                </Link>
                            ))}
                        </div>
                    </div>
                </Portal>
            </Transition>
        </li>
    );
};
