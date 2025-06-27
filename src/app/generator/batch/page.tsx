// src/app/generator/batch/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";
import ColumnMapper from "@/components/generator/ColumnMapper";
import { FiUpload, FiFileText, FiGrid, FiTag, FiCpu, FiMaximize } from "react-icons/fi";
import { LabelTemplate } from "@prisma/client";

type GenerationMode = "qr_zip" | "barcode_zip" | "print_labels";

export default function BatchGeneratorHub() {
    const [mode, setMode] = useState<GenerationMode | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [rows, setRows] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string> | null>(null);
    const [templates, setTemplates] = useState<LabelTemplate[]>([]); // Para el modo de impresión
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

    const router = useRouter();

    const handleModeSelect = (selectedMode: GenerationMode) => {
        setMode(selectedMode);
        // Si el modo es para imprimir, cargamos las plantillas
        if (selectedMode === 'print_labels') {
            fetch('/api/designer/templates')
                .then(res => res.json())
                .then(setTemplates)
                .catch(() => toast.error("Could not load templates."));
        }
    };

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setMapping(null);

        const data = await f.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        setHeaders(jsonRows[0]?.filter(String) || []);
        setRows(XLSX.utils.sheet_to_json(sheet, { defval: "" }));
    };

    const handleProceed = () => {
        if (!mapping) {
            return toast.error("Please map the columns before proceeding.");
        }
        if (mode === 'print_labels' && !selectedTemplateId) {
            return toast.error("Please select a label template.");
        }

        // Guardamos los datos en sessionStorage para pasarlos a la siguiente página
        sessionStorage.setItem('batchData', JSON.stringify(rows));
        sessionStorage.setItem('batchMapping', JSON.stringify(mapping));
        sessionStorage.setItem('batchTemplateId', selectedTemplateId);

        // Redirigimos a la nueva página de vista previa de impresión
        router.push('/generator/batch/print-preview');
    };

    const resetFlow = () => {
        setMode(null);
        setFile(null);
        setRows([]);
        setHeaders([]);
        setMapping(null);
    };

    return (
        <main className="max-w-4xl mx-auto p-6 text-white">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Batch Production Center</h1>
                <p className="text-gray-400 mt-2">Choose your production method.</p>
            </div>

            {!mode ? (
                // --- Pantalla de Selección de Modo ---
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ModeCard icon={FiGrid} title="Generate QR Code ZIP" onClick={() => handleModeSelect('qr_zip')} />
                    <ModeCard icon={FiMaximize} title="Generate Barcode ZIP" onClick={() => handleModeSelect('barcode_zip')} />
                    <ModeCard icon={FiTag} title="Print Labels from Template" onClick={() => handleModeSelect('print_labels')} />
                </div>
            ) : (
                // --- Flujo de Carga y Mapeo ---
                <div className="space-y-8 bg-gray-900 p-8 rounded-lg">
                    <button onClick={resetFlow} className="text-sm text-blue-400 hover:underline">‹ Back to selection</button>

                    {/* 1. Carga de Archivo */}
                    <div>
                        <h2 className="text-xl font-bold mb-4">1. Upload Excel File</h2>
                        <input type="file" accept=".xlsx, .xls" onChange={handleFile} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"/>
                    </div>

                    {/* 2. Mapeo */}
                    {headers.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">2. Map Columns</h2>
                            <ColumnMapper headers={headers} onMappingComplete={setMapping} />
                        </div>
                    )}

                    {/* 3. Selección de Plantilla (solo para modo de impresión) */}
                    {mode === 'print_labels' && mapping && (
                         <div>
                            <h2 className="text-xl font-bold mb-4">3. Select Label Template</h2>
                            <select value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)} className="block w-full p-2 bg-gray-800 border-gray-600 rounded-md text-white">
                                <option value="" disabled>-- Choose a template --</option>
                                {templates.map(template => (
                                    <option key={template.id} value={template.id}>{template.name} ({template.width}mm x {template.height}mm)</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* 4. Botón de Proceder */}
                    {mapping && (
                        <button onClick={handleProceed} className="w-full flex justify-center items-center gap-2 p-3 bg-green-600 hover:bg-green-700 rounded font-bold text-lg">
                            Proceed to Next Step <FiCpu/>
                        </button>
                    )}
                </div>
            )}
        </main>
    );
}

const ModeCard = ({ icon: Icon, title, onClick }: { icon: React.ElementType, title: string, onClick: () => void }) => (
    <button onClick={onClick} className="p-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex flex-col items-center justify-center text-center transition-all hover:scale-105">
        <Icon className="h-12 w-12 mb-4 text-blue-400"/>
        <h3 className="font-semibold text-lg">{title}</h3>
    </button>
);