"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { FiCopy, FiDownload } from "react-icons/fi";
import { toast } from "react-hot-toast";

function encode(text: string) {
  return btoa(text);
}

function decode(text: string) {
  try {
    return atob(text);
  } catch {
    return text;
  }
}

export default function QRGeneratorPage() {
  const [fields, setFields] = useState({
    key: "",
    year: "",
    pedimento: "",
    description: "",
    line: "",
    shelf: "",
    position: "",
  });
  const [encoded, setEncoded] = useState(true);

  const raw = `${fields.key}/${fields.year}${fields.pedimento}/${fields.description}/${fields.line}/${fields.shelf}/${fields.position}`;
  const value = encoded ? encode(raw) : raw;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };

  const handleDownload = () => {
    const svg = document.querySelector(".qr-code svg");
    if (!svg) return;

    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `qr_${fields.key}.svg`;
    a.click();

    toast.success("QR downloaded");
  };

  return (
    <main className="max-w-xl mx-auto p-6 bg-gray-900 rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4">Generate QR Code</h1>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {Object.keys(fields).map((k) => (
          <input
            key={k}
            name={k}
            placeholder={k}
            value={fields[k as keyof typeof fields]}
            onChange={handleChange}
            className="bg-gray-800 border border-gray-600 p-2 rounded text-white"
          />
        ))}
      </div>
      <label className="flex items-center gap-2 mb-4">
        <input type="checkbox" checked={encoded} onChange={() => setEncoded(!encoded)} />
        Encode Base64
      </label>

      <div className="flex flex-col items-center">
        <div className="qr-code bg-white p-2 rounded">
          <QRCode value={value} size={200} />
        </div>
        <div className="flex gap-4 mt-3">
          <button onClick={handleCopy} className="flex items-center gap-2 text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded">
            <FiCopy /> Copy
          </button>
          <button onClick={handleDownload} className="flex items-center gap-2 text-sm px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded">
            <FiDownload /> Download
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 break-all max-w-full">{value}</p>
      </div>
    </main>
  );
}
