// src/app/scanner/page.tsx
"use client";

import { useState, useEffect } from "react";
import ScannerCore from "@/components/scanner/ScannerCore";
import ScanResultPanel from "@/components/scanner/ScanResultPanel";
import ManualInput from "@/components/scanner/ManualInput";
import ScanTable from "@/components/scanner/ScanTable";
import { ScanData } from "@/types";
import { toast } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import SessionSelector from "@/components/scanner/SessionSelector";
import { FiActivity, FiXCircle } from "react-icons/fi";

export default function ScannerPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [records, setRecords] = useState<ScanData[]>([]);
  const [rawCode, setRawCode] = useState<string>("");

  const fetchRecordsForSession = async (sessionId: string) => {
    try {
      // Futuramente, esta API necesita ser actualizada para filtrar por sesión
      const res = await fetch(`/api/inventory?sessionId=${sessionId}`);
      if (!res.ok) throw new Error("Could not fetch records for this session");
      const data = await res.json();
      setRecords(data);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (activeSessionId) {
      fetchRecordsForSession(activeSessionId);
    }
  }, [activeSessionId]);

  const handleNewScan = (scan: ScanData, raw: string) => {
    if (typeof window !== "undefined") {
      if ("vibrate" in navigator) navigator.vibrate(100);
      const audio = new Audio("/beep.mp3");
      audio.play().catch(() => {});
    }
    setRecords((prev) => [scan, ...prev]);
    setRawCode(raw);
    toast.success(`Item ${scan.key} added to session.`);
  };

  const handleDelete = async (id: number) => {
    // ... (lógica de borrado existente)
  };

  const quitSession = () => {
    setActiveSessionId(null);
    setRecords([]);
    setRawCode("");
  }

  // Si no hay sesión activa, muestra el selector
  if (!activeSessionId) {
    return (
      <main className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <SessionSelector onSessionSelect={setActiveSessionId} />
      </main>
    );
  }

  // Si hay una sesión activa, muestra la interfaz del escáner
  return (
    <main className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-center flex items-center gap-2">
          <FiActivity className="text-green-400"/>
          <span>Scanning in Session: <span className="text-blue-400">{activeSessionId}</span></span>
        </h1>
        <button onClick={quitSession} className="flex items-center gap-2 px-3 py-1 bg-red-600/20 text-red-300 border border-red-500/30 rounded text-sm hover:bg-red-600/40">
            <FiXCircle/>
            Quit Session
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <ScannerCore onScanSuccess={handleNewScan} sessionId={activeSessionId} />
          <ManualInput onManualSubmit={handleNewScan} sessionId={activeSessionId} />
        </div>
        <div className="space-y-6">
          <ScanResultPanel rawCode={rawCode} />
          <ScanTable records={records} onDelete={handleDelete} />
        </div>
      </div>
    </main>
  );
}