"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiBox, FiHome, FiLayers, FiPlusCircle, FiRadio, FiMenu, FiX } from "react-icons/fi";

const navItems = [
  { href: "/", label: "Home", icon: <FiHome /> },
  { href: "/scanner", label: "Scan", icon: <FiRadio /> },
  { href: "/generator/qr", label: "Generate QR", icon: <FiRadio /> },
  { href: "/generator/barcode", label: "Generate Bar", icon: <FiRadio /> },
  { href: "/inventory/new", label: "New Session", icon: <FiPlusCircle /> },
  { href: "/inventory", label: "Sessions", icon: <FiLayers /> },
];

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white py-3 px-4 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-lg font-bold">QR & Inventory</h1>

        <div className="md:hidden">
          <button onClick={() => setOpen(!open)}>
            {open ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>

        <ul className="hidden md:flex gap-6 text-sm">
          {navItems.map(({ href, label, icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-1 hover:text-blue-400 transition ${
                  pathname === href ? "text-blue-500" : "text-white"
                }`}
              >
                {icon} {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {open && (
        <ul className="md:hidden mt-2 space-y-2 px-2 text-sm">
          {navItems.map(({ href, label, icon }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 py-2 px-2 rounded hover:bg-gray-800 ${
                  pathname === href ? "text-blue-500 font-semibold" : "text-white"
                }`}
              >
                {icon} {label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
