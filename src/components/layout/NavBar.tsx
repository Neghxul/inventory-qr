// src/components/layout/NavBar.tsx

"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { FiLogOut, FiLogIn, FiUser, FiSearch } from "react-icons/fi";

export default function NavBar() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <header className="bg-gray-900 text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-end h-16 px-4">
        {/* Aquí podríamos añadir una barra de búsqueda en el futuro */}
        {/* <div className="flex-1"> <FiSearch/> Search... </div> */}

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm hidden sm:block">
                  {session.user?.email}
                </span>
                <FiUser className="sm:hidden" />
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                title="Sign Out"
              >
                <FiLogOut className="text-red-400 h-5 w-5" />
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              title="Sign In"
            >
              <FiLogIn />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}