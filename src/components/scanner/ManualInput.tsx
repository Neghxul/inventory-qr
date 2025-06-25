// src/components/scanner/ManualInput.tsx
"use client";

import { useState } from "react";
import { FiSend } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { parseScannedCode } from "@/lib/scannerUtils";
import { ScanData } from "@/types";

// 1. Añadimos sessionId a las Props
interface Props {
  onManualSubmit: (data: ScanData, raw: string) => void;
  sessionId: string;
}

// 2. Recibimos sessionId en el componente
export default function ManualInput({ onManualSubmit, sessionId }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const parsed = await parseScannedCode(input);
      if (!parsed) {
        throw new Error("Invalid code format");
      }
      
      // 3. Añadimos sessionId al objeto
      const dataToSend = { ...parsed, sessionId };

      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (res.status === 409) {
        toast("Already exists", { icon: "⚠️" });
      } else if (!res.ok) {
        throw new Error("Failed to save item");
      } else {
        const saved = await res.json();
        onManualSubmit(saved, input);
        toast.success("Added manually");
        setInput("");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">Manual Code Input</h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Enter code manually"
          className="flex-1 px-3 py-2 rounded bg-gray-900 border border-gray-700 text-white text-sm"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white flex items-center gap-2 disabled:bg-gray-600"
        >
          <FiSend /> {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}