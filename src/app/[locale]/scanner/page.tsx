// src/app/scanner/page.tsx
"use client";

import { useState, useEffect } from "react";
import ScanResultPanel from "@/components/scanner/ScanResultPanel";
import ScanTable from "@/components/scanner/ScanTable";
import { ScanData } from "@/types";
import { toast } from "react-hot-toast";
import SessionSelector from "@/components/scanner/SessionSelector";
import { FiActivity, FiXCircle, FiRadio } from "react-icons/fi";
import ScannerModal from "@/components/scanner/ScannerModal";

export default function ScannerPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState<string>(""); // Guardar nombre de la sesión
  const [records, setRecords] = useState<ScanData[]>([]);
  const [rawCode, setRawCode] = useState<string>("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const fetchRecordsForSession = async (sessionId: string) => {
      try {
          const res = await fetch(`/api/inventory-item?sessionId=${sessionId}`);
          if (!res.ok) throw new Error("Could not fetch records");
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
    }
    setRecords(prev => [scan, ...prev]);
    setRawCode(raw);
    toast.success(`Item ${scan.key} added.`);
  };

  const handleSessionSelect = (sessionId: string, name: string) => {
    setActiveSessionId(sessionId);
    setSessionName(name);
  };

  const quitSession = () => {
    setActiveSessionId(null);
    setSessionName("");
    setRecords([]);
    setRawCode("");
  };

  if (!activeSessionId) {
    return (
      <main className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <SessionSelector onSessionSelect={handleSessionSelect} />
      </main>
    );
  }

  return (
    <main className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Scanner Dashboard</h1>
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <FiActivity className="text-green-400"/>
            Active Session: <span className="font-semibold text-blue-400">{sessionName}</span>
          </p>
        </div>
        <button onClick={quitSession} className="flex items-center gap-2 px-3 py-1 bg-red-600/20 text-red-300 border border-red-500/30 rounded text-sm hover:bg-red-600/40">
          <FiXCircle/> Quit
        </button>
      </div>

      {/* Acciones */}
      <div className="mb-8">
        <button onClick={() => setIsScannerOpen(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-bold">
          <FiRadio/> Start Scanning
        </button>
      </div>

      {/* Paneles de Información */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ScanResultPanel rawCode={rawCode} />
        <ScanTable records={records} onDelete={() => {}} />
      </div>

      {/* El Modal del Escáner */}
      <ScannerModal
        isOpen={isScannerOpen}
        setIsOpen={setIsScannerOpen}
        sessionId={activeSessionId}
        onScanSuccess={handleNewScan}
      />
    </main>
  );
}