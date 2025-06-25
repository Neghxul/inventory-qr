// src/app/generator/batch/page.tsx
"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import ColumnMapper from "@/components/generator/ColumnMapper";
import PreviewTable from "@/components/generator/PreviewTable"; // <-- Importamos el preview
import { FiUpload, FiFileText, FiDownload } from "react-icons/fi";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";

const APP_FIELDS = ["Clave", "Año", "Pedimento", "Descripción", "Línea", "Estante", "Posición", "Tipo"];

export default function BatchGeneratorPage() {
    const [file, setFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [rows, setRows] = useState<any[]>([]);
    const [mapping, setMapping] = useState<Record<string, string> | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]); // <-- Estado para el preview
    const [isGenerating, setIsGenerating] = useState(false);
    const [encoding, setEncoding] = useState(true);

    const processExcelData = (excelRows: any[], columnMapping: Record<string, string>) => {
        return excelRows.map(row => {
            const mappedRow: any = {};
            for (const appField in columnMapping) {
                const excelHeader = columnMapping[appField];
                if (excelHeader) {
                    mappedRow[appField] = row[excelHeader];
                }
            }
            return mappedRow;
        });
    };

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;

        if (!f.name.endsWith(".xlsx") && !f.name.endsWith(".xls")) { // <-- Acepta .xls
            toast.error("Please upload a valid .xlsx or .xls file");
            return;
        }

        setFile(f);
        setMapping(null);
        setPreviewData([]);

        const data = await f.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

        if (jsonRows.length > 0) {
            setHeaders(jsonRows[0].filter(String));
            setRows(XLSX.utils.sheet_to_json(sheet, { defval: "" }));
        } else {
            toast.error("The Excel file appears to be empty.");
            setHeaders([]);
            setRows([]);
        }
    };

    const handleMappingComplete = (newMapping: Record<string, string>) => {
        setMapping(newMapping);
        const processedPreview = processExcelData(rows, newMapping);
        setPreviewData(processedPreview.slice(0, 5)); // <-- Genera la data del preview
        toast.success("Mapping confirmed! Preview is now available.");
    }

    const handleGenerate = async () => {
        if (!rows.length || !mapping) {
            return toast.error("Please upload a file and complete the column mapping.");
        }

        setIsGenerating(true);
        toast.loading("Generating codes... This may take a moment.");

        const zip = new JSZip();
        let errorCount = 0;
        let successCount = 0;
        const processedRows = processExcelData(rows, mapping);

        for (const mappedData of processedRows) {
            const { Clave, Año, Pedimento, Tipo, ...rest } = mappedData;
            if (!Clave || !Año || !Pedimento || !Tipo) {
                errorCount++;
                continue;
            }

            const tipo = String(Tipo).toUpperCase().trim();
            const fileName = `<span class="math-inline">\{tipo\}\_</span>{Clave}-<span class="math-inline">\{Año\}</span>{Pedimento}`.replace(/[^a-zA-Z0-9-_]/g, '_');

            try {
                if (tipo === 'QR') {
                    const qrValue = `<span class="math-inline">\{Clave\}/</span>{Año}<span class="math-inline">\{Pedimento\}/</span>{rest.Descripción || ''}/<span class="math-inline">\{rest\.Línea \|\| ''\}/</span>{rest.Estante || ''}/${rest.Posición || ''}`;
                    const content = encoding ? btoa(qrValue) : qrValue;
                    const dataUrl = await QRCode.toDataURL(content, { margin: 2, width: 250 });
                    zip.file(`${fileName}.png`, dataUrl.split(',')[1], { base64: true });
                    successCount++;
                } else if (['BAR', 'BARRA', 'BARCODE'].includes(tipo)) {
                    const canvas = document.createElement("canvas");
                    JsBarcode(canvas, `<span class="math-inline">\{Clave\}\-</span>{Año}${Pedimento}`, { format: "CODE128", displayValue: true });
                    const dataUrl = canvas.toDataURL("image/png");
                    zip.file(`${fileName}.png`, dataUrl.split(',')[1], { base64: true });
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (err) {
                console.error(`Failed to generate code for row:`, mappedData, err);
                errorCount++;
            }
        }

        toast.dismiss();

        if (successCount > 0) {
            const blob = await zip.generateAsync({ type: "blob" });
            const safeName = file!.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_');
            saveAs(blob, `codes_${safeName}_${Date.now()}.zip`);
            toast.success(`${successCount} codes generated successfully!`);
        } else {
            toast.error("No codes could be generated. Check your data and mapping.");
        }

        if (errorCount > 0) {
            toast.error(`${errorCount} rows were skipped due to missing data or errors.`);
        }

        setIsGenerating(false);
    };

    const handleTemplate = () => {
        const ws = XLSX.utils.aoa_to_sheet([APP_FIELDS]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
        const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
        saveAs(new Blob([buf], { type: "application/octet-stream" }), "plantilla_codigos.xlsx");
    };

    return (
        <main className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg shadow text-white">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">Batch Code Generator</h1>
                <p className="text-gray-400 mt-2">Generate thousands of QR or Barcodes from an Excel file.</p>
            </div>

            <div className="space-y-8">
                {/* ... (Paso 1, igual que antes pero con accept actualizado) ... */}
                <div className="p-6 bg-gray-800/50 rounded-lg">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><span className="text-blue-400 font-black">1</span> Upload your file</h2>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <label htmlFor="file-upload" className="w-full flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium transition-colors">
                            <FiUpload />
                            <span>{file ? file.name : "Select .xlsx, .xls file"}</span>
                        </label>
                        <input id="file-upload" type="file" accept=".xlsx, .xls" onChange={handleFile} className="hidden" />
                        <button onClick={handleTemplate} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded text-sm" title="Download Template">
                            <FiFileText /> Template
                        </button>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <input id="encoding" type="checkbox" checked={encoding} onChange={() => setEncoding(!encoding)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"/>
                        <label htmlFor="encoding" className="text-sm text-gray-300">Encode QR content (Base64)</label>
                    </div>
                </div>

                {headers.length > 0 && (
                    <div className="p-6 bg-gray-800/50 rounded-lg">
                        <ColumnMapper headers={headers} onMappingComplete={handleMappingComplete} />
                        <PreviewTable previewData={previewData} headers={APP_FIELDS} />
                    </div>
                )}

                {mapping && (
                    <div className="p-6 bg-blue-600/10 border border-blue-500/30 rounded-lg">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><span className="text-green-400 font-black">3</span> Generate Codes</h2>
                        <button onClick={handleGenerate} disabled={isGenerating} className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded font-medium disabled:bg-gray-500">
                            <FiDownload />
                            {isGenerating ? "Generating..." : "Generate ZIP File"}
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}