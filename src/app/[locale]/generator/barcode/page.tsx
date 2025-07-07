"use client";

import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { FiDownload } from "react-icons/fi";
import { toast } from "react-hot-toast";

export default function BarcodeGeneratorPage() {
  const [key, setKey] = useState("");
  const [year, setYear] = useState("");
  const [pedimento, setPedimento] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);

  const code = `${key}-${year}${pedimento}`;

  useEffect(() => {
    if (svgRef.current && key && year && pedimento) {
      JsBarcode(svgRef.current, code, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 80,
        displayValue: true,
      });
    }
  }, [key, year, pedimento]);

  const handleDownload = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `barcode_${key}_${year}${pedimento}.svg`;
    a.click();

    toast.success("Barcode downloaded");
  };

  return (
    <main className="max-w-xl mx-auto p-6 bg-gray-900 rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4">Generate Barcode</h1>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          placeholder="Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="bg-gray-800 border border-gray-600 p-2 rounded text-white"
        />
        <input
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="bg-gray-800 border border-gray-600 p-2 rounded text-white"
        />
        <input
          placeholder="Pedimento"
          value={pedimento}
          onChange={(e) => setPedimento(e.target.value)}
          className="bg-gray-800 border border-gray-600 p-2 rounded text-white"
        />
      </div>
      <div className="flex flex-col items-center">
        <svg ref={svgRef} className="bg-white rounded p-2" />
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 text-sm px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded mt-4"
        >
          <FiDownload /> Download
        </button>
      </div>
    </main>
  );
}
