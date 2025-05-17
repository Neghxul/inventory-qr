"use client";

import Link from "next/link";
import { FiAlertTriangle, FiArrowLeft } from "react-icons/fi";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center text-center px-4">
      <FiAlertTriangle className="text-yellow-400 text-6xl mb-4" />
      <h1 className="text-3xl font-bold mb-2">404 - Page Not Found</h1>
      <p className="text-gray-400 mb-6">The page you are looking for does not exist or has been moved.</p>
      <Link
        href="/"
        className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded"
      >
        <FiArrowLeft /> Go to Home
      </Link>
    </main>
  );
}
