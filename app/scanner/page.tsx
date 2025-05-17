"use client";

import { useEffect, useState, useRef } from "react";
import ScannerCore from "@/components/scanner/ScannerCore";
import ScanResultPanel from "@/components/scanner/ScanResultPanel";
import ManualInput from "@/components/scanner/ManualInput";
import ScanTable from "@/components/scanner/ScanTable";
import { ScanData } from "@/types";
import { toast } from "react-hot-toast";
import { FiRadio } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

export default function ScannerPage() {
  const [records, setRecords] = useState<ScanData[]>([]);
  const [lastScan, setLastScan] = useState<ScanData | null>(null);
  const [rawCode, setRawCode] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      toast.error("Failed to fetch scan history");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleNewScan = (scan: ScanData, raw: string) => {
    if (typeof window !== "undefined") {
      if ("vibrate" in navigator) {
        navigator.vibrate(100);
      }
      const audio = new Audio("/beep.mp3");
      audio.play().catch(() => {});
    }
    setRecords((prev) => [scan, ...prev]);
    setLastScan(scan);
    setRawCode(raw);
    setIsOpen(false);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        toast.success("Deleted successfully");
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to delete record");
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4">
      <h1 className="text-2xl font-bold text-center mb-6">QR / Barcode Scanner</h1>

      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded"
        >
          <FiRadio /> Start Scanning
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                ref={modalRef}
                className="bg-gray-900 p-4 rounded-lg w-full max-w-md"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ScannerCore onScanSuccess={handleNewScan} />
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-4 block mx-auto px-4 py-1 text-sm bg-red-700 hover:bg-red-800 rounded"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ScanResultPanel rawCode={rawCode} />
        <ManualInput onManualSubmit={handleNewScan} />
        <ScanTable records={records} onDelete={handleDelete} />
      </div>
    </main>
  );
}
