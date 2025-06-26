// src/components/scanner/SessionSelector.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FiLayers, FiPlusCircle } from "react-icons/fi";
import Link from "next/link";

interface Session {
  id: string;
  name: string;
  createdAt: string;
}

interface SessionSelectorProps {
  onSessionSelect: (sessionId: string, name: string) => void;
}

export default function SessionSelector({ onSessionSelect }: SessionSelectorProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // Futuramente, esta API debería devolver solo las sesiones del usuario logueado.
        const res = await fetch("/api/inventory-session");
        if (!res.ok) throw new Error("Failed to fetch sessions");
        const data = await res.json();
        setSessions(data);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  if (isLoading) {
    return <p className="text-gray-400">Loading sessions...</p>;
  }

  if (sessions.length === 0) {
    return (
        <div className="text-center p-8 bg-gray-800/50 rounded-lg">
            <h3 className="text-xl font-bold text-white">No Inventory Sessions Found</h3>
            <p className="text-gray-400 mt-2 mb-4">You need to create a session before you can start scanning.</p>
            <Link href="/inventory/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium">
                <FiPlusCircle />
                Create First Session
            </Link>
        </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
         <h2 className="text-xl font-bold text-center mb-4">Select an Inventory Session</h2>
         <div className="space-y-3">
            {sessions.map(session => (
                <button 
                    key={session.id}
                    onClick={() => onSessionSelect(session.id, session.name)}
                    className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left"
                >
                    <div className="flex items-center gap-3">
                        <FiLayers className="text-blue-400"/>
                        <div>
                            <p className="font-semibold text-white">{session.name}</p>
                            <p className="text-xs text-gray-400">
                                Created: {new Date(session.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <FiPlusCircle className="text-green-400" title="Select Session"/>
                </button>
            ))}
         </div>
    </div>
  );
}