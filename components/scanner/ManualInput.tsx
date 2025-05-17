"use client";

import { useState } from "react";
import { FiSend } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { parseScannedCode } from "@/lib/scannerUtils";
import { ScanData } from "@/types";

interface Props {
  onManualSubmit: (data: ScanData, raw: string) => void;
}

export default function ManualInput({ onManualSubmit }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const parsed = await parseScannedCode(input);
      if (!parsed) throw new Error();

      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      if (res.status === 409) {
        toast("Already exists", { icon: "⚠️" });
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error();
      const saved = await res.json();
      onManualSubmit(saved, input);
      toast.success("Added manually");
      setInput("");
    } catch {
      toast.error("Invalid format or failed to save");
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">Manual Code Input</h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter code manually"
          className="flex-1 px-3 py-2 rounded bg-gray-900 border border-gray-700 text-white text-sm"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white flex items-center gap-2"
        >
          <FiSend /> Submit
        </button>
      </div>
    </div>
  );
}
