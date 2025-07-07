// src/components/designer/TemplateGallery.tsx
"use client";

import { useState, useEffect } from 'react';
import { LabelTemplate } from "@prisma/client";
import Link from "next/link";
import { FiEdit, FiTrash2, FiPrinter } from "react-icons/fi"; // Añade FiPrinter
import { toast } from 'react-hot-toast';
import { setupZebraPrinter, sendZplToPrinter } from '@/lib/services/zebra-print-service';


interface Props {
    initialTemplates: LabelTemplate[];
}

export default function TemplateGallery({ initialTemplates }: Props) {
    const [templates, setTemplates] = useState(initialTemplates);
    const [printerName, setPrinterName] = useState<string | null>(null);

    useEffect(() => {
        setupZebraPrinter()
            .then(setPrinterName)
            .catch(error => {
                console.error("Zebra Printer setup failed:", error);
            });
    }, []);

    const handleDelete = async (templateId: string) => {
        // Confirmación para evitar borrados accidentales
        if (!confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
            return;
        }

        try {
            const res = await fetch(`/api/designer/templates/${templateId}`, { method: 'DELETE' });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Failed to delete template.");
            }

            // Actualiza la UI instantáneamente al eliminar la plantilla del estado.
            setTemplates(current => current.filter(t => t.id !== templateId));
            toast.success("Template deleted successfully.");

        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handlePrint = async (template: LabelTemplate) => {
        if (!printerName) {
            return toast.error("Printer is not ready. Please wait or check connection.");
        }

        const toastId = toast.loading("Generating label ZPL...");

        try {
            const testData = {
                clave: 'TEST-123',
                año: '25',
                pedimento: '9876543',
                descripción: 'SAMPLE PRODUCT',
                línea: 'A1',
                estante: 'B2',
                posición: 'C3',
                tipo: 'QR'
            };
            
            const res = await fetch(`/api/designer/templates/${template.id}/print`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: testData })
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Failed to generate ZPL code.");
            }

            const zpl = await res.text();

            toast.loading("Sending to printer...", { id: toastId });
            await sendZplToPrinter(zpl);

            toast.success("Print job sent successfully!", { id: toastId });

        } catch (error: any) {
            toast.dismiss(toastId);
            toast.error(error.message);
        }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {templates.map((template) => (
                <div key={template.id} className="bg-gray-900 rounded-lg shadow-lg overflow-hidden flex flex-col group">
                    {/* Vista Previa */}
                    <div className="bg-white h-40 flex items-center justify-center text-gray-500 border-b-4 border-gray-900">
                         {/* Usaremos la URL de la imagen cuando la subida de archivos esté implementada */}
                         <span className="text-black font-bold">Preview</span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-white truncate" title={template.name}>{template.name}</h3>
                        <p className="text-sm text-gray-400">{template.width}mm x {template.height}mm</p>
                        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-end items-center gap-2">
                            <button onClick={() => handlePrint(template)} disabled={!printerName} className="p-2 hover:bg-green-500/20 rounded-full text-green-400 disabled:text-gray-600 disabled:hover:bg-transparent" title={printerName ? "Print with this template" : "Printer not available"}>
                                <FiPrinter/>
                            </button>
                            <Link href={`/designer/templates/${template.id}/edit`} className="p-2 hover:bg-blue-500/20 rounded-full text-blue-400" title="Edit Template">
                                <FiEdit/>
                            </Link>
                            <button onClick={() => handleDelete(template.id)} className="p-2 hover:bg-red-500/20 rounded-full text-red-400" title="Delete Template">
                                <FiTrash2/>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}