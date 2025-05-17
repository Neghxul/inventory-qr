"use client";

import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";

export default function BatchGeneratorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [encoding, setEncoding] = useState(true);
  const [preview, setPreview] = useState<any | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [summary, setSummary] = useState({ qr: 0, bar: 0, errors: 0 });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.name.endsWith(".xlsx")) {
      setFile(f);
    } else {
      toast.error("Upload a valid .xlsx file");
    }
  };

  const handleGenerate = async () => {
    if (!file) return toast.error("No file selected");

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) return toast.error("No rows found");
    setPreview(rows[0]);

    const zip = new JSZip();
    let errorCount = 0;
    let qrCount = 0;
    let barCount = 0;

    for (const row of rows) {
      const r = row as any;
      if (!r.Clave || !r.Año || !r.Pedimento || !r.Tipo) {
        errorCount++;
        continue;
      }

      const value = `${r.Clave}/${r.Año}${r.Pedimento}/${r.Descripción || ""}/${r.Línea || ""}/${r.Estante || ""}/${r.Posición || ""}`;
      const content = encoding ? btoa(value) : value;
      const fileName = `${r.Tipo === "BAR" ? "bar" : "qr"}_${r.Clave}-${r.Año}${r.Pedimento}`.replaceAll("/", "-");

      if (r.Tipo === "QR") {
        const canvas = document.createElement("canvas");
        await QRCode.toCanvas(canvas, content, { margin: 2, width: 250 });
        zip.file(`${fileName}.png`, canvas.toDataURL("image/png").split(",")[1], { base64: true });
        qrCount++;
      } else {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        JsBarcode(svg, `${r.Clave}-${r.Año}${r.Pedimento}`, { format: "CODE128" });
        const xml = new XMLSerializer().serializeToString(svg);
        zip.file(`${fileName}.svg`, xml);
        barCount++;
      }
    }

    setSummary({ qr: qrCount, bar: barCount, errors: errorCount });

    if (errorCount > 0) toast(`Skipped ${errorCount} invalid rows`);

    const blob = await zip.generateAsync({ type: "blob" });
    const safeName = file.name.replace(/\.[^/.]+$/, '').replaceAll(/[^a-zA-Z0-9-_]/g, '_');
saveAs(blob, `codes_${safeName}_${Date.now()}.zip`);
    toast.success("ZIP generated");
  };

  const handleTemplate = () => {
    const headers = ["Clave", "Año", "Pedimento", "Descripción", "Línea", "Estante", "Posición", "Tipo"];
    const sample = ["RFX123", "24", "456789", "Motor", "Linea1", "A", "B2", "QR"];
    const ws = XLSX.utils.aoa_to_sheet([headers, sample]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), "plantilla_codigos.xlsx");
  };

  useEffect(() => {
    if (!preview) return;
    const value = `${preview.Clave}/${preview.Año}${preview.Pedimento}/${preview.Descripción || ""}/${preview.Línea || ""}/${preview.Estante || ""}/${preview.Posición || ""}`;
    const content = encoding ? btoa(value) : value;

    if (preview.Tipo === "QR" && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, content, { margin: 2, width: 200 });
    } else if (preview.Tipo === "BAR" && svgRef.current) {
      JsBarcode(svgRef.current, `${preview.Clave}-${preview.Año}${preview.Pedimento}`, {
        format: "CODE128",
        width: 2,
        height: 80,
        displayValue: true,
      });
    }
  }, [preview, encoding]);

  return (
    <main className="max-w-2xl mx-auto p-6 bg-gray-900 rounded-lg shadow text-white">
      <h1 className="text-xl font-bold mb-4">Batch Code Generator</h1>

      <div className="mb-4">
        <input type="file" accept=".xlsx" onChange={handleFile} className="mb-2" />
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={encoding} onChange={() => setEncoding(!encoding)} />
          <label>Encode QR content (base64)</label>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <button onClick={handleGenerate} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">Generate ZIP</button>
        <button onClick={handleTemplate} className="px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded">Download Template</button>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Accepted columns: Clave, Año, Pedimento, Descripción, Línea, Estante, Posición, Tipo (QR or BAR)
      </p>

      {preview && (
        <div className="mt-6 border-t border-gray-700 pt-4">
          <h2 className="text-lg font-bold mb-2">Preview:</h2>
          <p className="text-sm text-gray-300 mb-2">
            {encoding
              ? btoa(`${preview.Clave}/${preview.Año}${preview.Pedimento}/${preview.Descripción || ""}/${preview.Línea || ""}/${preview.Estante || ""}/${preview.Posición || ""}`)
              : `${preview.Clave}/${preview.Año}${preview.Pedimento}/${preview.Descripción || ""}/${preview.Línea || ""}/${preview.Estante || ""}/${preview.Posición || ""}`}
          </p>
          <p className="text-sm text-gray-500 mb-2">Type: {preview.Tipo}</p>
          <p className="text-sm text-gray-500 mb-2">Decoded: {atob(encoding ? btoa(`${preview.Clave}/${preview.Año}${preview.Pedimento}/${preview.Descripción || ""}/${preview.Línea || ""}/${preview.Estante || ""}/${preview.Posición || ""}`) : `${preview.Clave}/${preview.Año}${preview.Pedimento}/${preview.Descripción || ""}/${preview.Línea || ""}/${preview.Estante || ""}/${preview.Posición || ""}`)}</p>
          {preview.Tipo === "QR" ? (
            <canvas ref={canvasRef} className="bg-white p-1 rounded" />
          ) : (
            <svg ref={svgRef} className="bg-white p-1 rounded" />
          )}
        </div>
      )}

      {(summary.qr > 0 || summary.bar > 0 || summary.errors > 0) && (
        <div className="mt-6 border-t border-gray-700 pt-4">
          <h2 className="text-lg font-bold mb-2">Summary:</h2>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>QR codes generated: <strong>{summary.qr}</strong></li>
            <li>Barcodes generated: <strong>{summary.bar}</strong></li>
            <li>Errors skipped: <strong>{summary.errors}</strong></li>
          </ul>
        </div>
      )}
    </main>
  );
}
