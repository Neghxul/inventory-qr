"use client";

import { useState } from "react";
import { FiCopy } from "react-icons/fi";
import { isBase64 } from "@/lib/scannerUtils";
import { toast } from "react-hot-toast";

interface Props {
  rawCode: string;
}

export default function ScanResultPanel({ rawCode }: Props) {
  const [showDecoded, setShowDecoded] = useState(true);

  const displayText = isBase64(rawCode) && !showDecoded ? rawCode : tryDecode(rawCode);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(displayText);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showDecoded}
            onChange={(e) => setShowDecoded(e.target.checked)}
          />
          Show Decoded
        </label>
        <button
          onClick={copyToClipboard}
          className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded flex items-center gap-1"
        >
          <FiCopy /> Copy
        </button>
      </div>
      <div className="bg-gray-900 p-2 rounded text-xs break-all border border-gray-700">
        {displayText || "No code scanned yet."}
      </div>
    </div>
  );
}

function tryDecode(str: string) {
  try {
    return atob(str);
  } catch {
    return str;
  }
}
