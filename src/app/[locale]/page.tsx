"use client";

import Link from "next/link";
import { FiRadio, FiLayers, FiPlusCircle } from "react-icons/fi";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to QR & Inventory App</h1>
      <p className="text-gray-400 mb-6 max-w-xl">
        Scan, register, and track your inventory with precision. Start a new session, view history, or export your data effortlessly.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
        <Link
          href="/scanner"
          className="bg-blue-700 hover:bg-blue-800 px-6 py-4 rounded flex flex-col items-center"
        >
          <FiRadio className="text-2xl mb-1" />
          Start Scanning
        </Link>
        <Link
          href="/inventory/new"
          className="bg-green-700 hover:bg-green-800 px-6 py-4 rounded flex flex-col items-center"
        >
          <FiPlusCircle className="text-2xl mb-1" />
          New Inventory Session
        </Link>
        <Link
          href="/inventory"
          className="bg-gray-700 hover:bg-gray-800 px-6 py-4 rounded flex flex-col items-center"
        >
          <FiLayers className="text-2xl mb-1" />
          View Sessions
        </Link>
      </div>
    </main>
  );
}
