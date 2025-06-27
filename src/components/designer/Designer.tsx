// src/components/designer/Designer.tsx
"use client";

import React, { useState, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { FiType, FiGrid, FiMaximize, FiImage, FiSave, FiTrash2, FiDownload } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import QRCode from 'react-qr-code';
import Barcode from 'react-barcode';
import * as htmlToImage from 'html-to-image';
import { LabelTemplate } from '@prisma/client';

// --- Tipos de Datos Mejorados ---
type ElementType = "text" | "qr" | "barcode" | "image";

interface TextProps { dataField: string; fontSize: number; fontWeight: 'normal' | 'bold'; color: string; wordWrap: boolean; }
interface ImageProps { src: string; }
interface QrProps { formatString: string; isEncoded: boolean; }
interface BarcodeProps { dataFieldString: string; }
// --- Componente Principal ---

interface DesignerProps {
    existingTemplate?: LabelTemplate | null; // <-- Nueva prop opcional
}

export interface DesignerElement {
  id: string;
  type: ElementType;
  x: number; y: number; width: number; height: number;
  props: TextProps | ImageProps | QrProps | BarcodeProps;
}

// --- Constantes y Helpers ---
const DPI = 203;
const mmToPx = (mm: number) => (mm / 25.4) * DPI;
const pxToMm = (px: number) => (px / DPI) * 25.4;
const AVAILABLE_FIELDS = ["clave", "año", "pedimento", "descripción", "línea", "estante", "posición", "tipo"];

// --- Componente Principal ---
export default function DesignerLayout({ existingTemplate }: DesignerProps) {

  const [templateName, setTemplateName] = useState(existingTemplate?.name || "My New Template");
  const [elements, setElements] = useState<DesignerElement[]>(existingTemplate?.elements as any[] || []);
  const [canvasSize, setCanvasSize] = useState({ 
        width: String(existingTemplate?.width || 50), 
        height: String(existingTemplate?.height || 25) 
    });
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const updateElement = (id: string, updates: Partial<DesignerElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setSelectedElementId(null); // Deseleccionar al borrar
  };
  
  const addElement = async (type: ElementType) => {
    const newId = `el_${elements.length}_${Date.now()}`;
    let newElement: DesignerElement;

    switch(type) {
        case 'image':
            const url = prompt("Enter image URL:");
            if (!url) return;
            toast.loading("Fetching image...");
            try {
                // Usamos nuestro proxy para obtener una data URL segura
                const res = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`);
                if (!res.ok) throw new Error("Could not fetch image via proxy.");
                const { dataUrl } = await res.json();
                newElement = { id: newId, type, x: 10, y: 10, width: mmToPx(25), height: mmToPx(25), props: { src: dataUrl } };
                toast.dismiss();
            } catch (error) {
                toast.dismiss();
                toast.error("Failed to load image. Check URL and CORS policy.");
                return;
            }
            break;
        case 'qr':
            newElement = { id: newId, type, x: 10, y: 10, width: mmToPx(20), height: mmToPx(20), props: { formatString: '{clave}/{año}{pedimento}/{descripción}', isEncoded: true } };
            break;
        case 'barcode':
            newElement = { id: newId, type, x: 10, y: 10, width: mmToPx(40), height: mmToPx(15), props: { dataFieldString: '{clave}-{año}{pedimento}' } };
            break;
        default:
            newElement = { id: newId, type, x: 10, y: 10, width: mmToPx(30), height: mmToPx(10), props: { dataField: '{descripción}', fontSize: 14, fontWeight: 'normal', color: '#000000', wordWrap: true } };
    }
    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newId);
  };

  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>, dim: 'width' | 'height') => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) { // Solo permite números
        setCanvasSize(s => ({...s, [dim]: value }));
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName) return toast.error("Template name is required.");
    if (!canvasRef.current) return toast.error("Canvas is not ready.");

    const isEditing = !!existingTemplate;
    const url = isEditing ? `/api/designer/templates/${existingTemplate.id}` : '/api/designer/templates';
    const method = isEditing ? 'PUT' : 'POST';

    // Deseleccionar cualquier elemento para quitar los bordes azules de la captura
    setSelectedElementId(null);
    toast.loading("Saving template and generating preview...");

    // Pequeña espera para que el DOM se actualice
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
        // 1. Definimos el filtro para ignorar los controles de redimensionamiento
        const filter = (node: HTMLElement) => {
            return !node.classList?.contains('react-resizable-handle');
        };

        // 2. Generamos la imagen UNA SOLA VEZ, aplicando el filtro
        const dataUrl = await htmlToImage.toPng(canvasRef.current, { 
            quality: 1.0, 
            pixelRatio: 1,
            filter: filter
        });

        // 3. Simulación de subida de archivo (como antes, pero ahora es útil)
        // En una app real:
        // const uploadResponse = await fetch('/api/upload', { method: 'POST', body: dataUrl });
        // const { url: finalImageUrl } = await uploadResponse.json();
        // Por ahora, usamos una URL simulada.
        const previewImageUrl = "https://example.com/path/to/generated_preview.png";
        console.log("SIMULATING UPLOAD: PNG Data URL length:", dataUrl.length);

        // 4. Hacemos la llamada a la API usando las variables correctas
        const res = await fetch(url, {
            method: method, // <-- Usamos el método dinámico
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: templateName,
                width: Number(canvasSize.width),
                height: Number(canvasSize.height),
                elements: elements,
                previewImageUrl: previewImageUrl // <-- Enviamos la URL simulada
            })
        });

        toast.dismiss();
        if (!res.ok) throw new Error(await res.text());
        
        const savedTemplate = await res.json();
        toast.success(`Template "${savedTemplate.name}" ${isEditing ? 'updated' : 'saved'}!`);

        // Redirigir a la galería después de guardar/actualizar
        window.location.href = '/designer/templates';

    } catch (error: any) {
        toast.dismiss();
        console.error("Failed to save template:", error);
        toast.error(error.message || "An unknown error occurred during save.");
    }
};

  const handleDownloadPng = async () => {
        if (!canvasRef.current) {
            return toast.error("Canvas is not ready.");
        }

        setIsDownloading(true);
        toast.loading("Generating PNG...");

        // Deseleccionar cualquier elemento para quitar los bordes azules
        setSelectedElementId(null);
        await new Promise(resolve => setTimeout(resolve, 50));

        const filter = (node: HTMLElement) => !node.classList?.contains('react-resizable-handle');

        try {
            const dataUrl = await htmlToImage.toPng(canvasRef.current, {
                quality: 1.0,
                pixelRatio: 1, // CRÍTICO para el tamaño real
                filter: filter,
                // Forzamos el tamaño exacto en píxeles según nuestro cálculo de DPI
                width: mmToPx(Number(canvasSize.width) || 0),
                height: mmToPx(Number(canvasSize.height) || 0),
            });

            // Crear un enlace temporal para descargar la imagen
            const link = document.createElement('a');
            link.download = `${templateName.replace(/\s+/g, '_')}.png`;
            link.href = dataUrl;
            link.click();

            toast.dismiss();
            toast.success("PNG downloaded successfully!");

        } catch (error) {
            toast.dismiss();
            console.error("Failed to generate PNG:", error);
            toast.error("Could not generate the PNG file.");
        } finally {
            setIsDownloading(false);
        }
    };

    const selectedElement = elements.find(el => el.id === selectedElementId);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* --- Panel Izquierdo: Herramientas y Propiedades --- */}
      <div className="w-full md:w-80 bg-gray-900 p-4 rounded-lg self-start space-y-6">
        <div>
          <h3 className="font-bold mb-2">Template Name</h3>
          <input type="text" value={templateName} onChange={e => setTemplateName(e.target.value)} className="w-full bg-gray-800 p-1 rounded" />
        </div>
        <div>
          <h3 className="font-bold mb-2">Label Size (mm)</h3>
          <div className="flex gap-2">
            <input type="text" value={canvasSize.width} onChange={e => handleDimensionChange(e, 'width')} className="w-full bg-gray-800 p-1 rounded" placeholder="Width" />
            <input type="text" value={canvasSize.height} onChange={e => handleDimensionChange(e, 'height')} className="w-full bg-gray-800 p-1 rounded" placeholder="Height" />
          </div>
        </div>
        <div>
          <h3 className="font-bold mb-2">Tools</h3>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => addElement('text')} className="flex items-center gap-2 p-2 bg-gray-700 hover:bg-gray-600 rounded"><FiType /> Text</button>
            <button onClick={() => addElement('image')} className="flex items-center gap-2 p-2 bg-gray-700 hover:bg-gray-600 rounded"><FiImage /> Image</button>
            <button onClick={() => addElement('qr')} className="flex items-center gap-2 p-2 bg-gray-700 hover:bg-gray-600 rounded"><FiGrid /> QR</button>
            <button onClick={() => addElement('barcode')} className="flex items-center gap-2 p-2 bg-gray-700 hover:bg-gray-600 rounded"><FiMaximize /> Barcode</button>
          </div>
        </div>
        {selectedElement && (
            <div className="border-t-2 border-blue-500 pt-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold">Properties ({selectedElement.type})</h3>
                    <button onClick={() => deleteElement(selectedElement.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded-full" title="Delete Element">
                        <FiTrash2 />
                    </button>
                </div>
                <PropertiesPanel element={selectedElement} onUpdate={updateElement} />
            </div>
        )}
        <button onClick={handleSaveTemplate} className="w-full flex items-center justify-center gap-2 p-2 bg-blue-600 hover:bg-blue-700 rounded mt-8">
            <FiSave /> Save Template
        </button>

        <button onClick={handleDownloadPng} disabled={isDownloading} className="w-full flex items-center justify-center gap-2 p-2 bg-green-600 hover:bg-green-700 rounded disabled:bg-gray-500">
          <FiDownload />
          {isDownloading ? 'Downloading...' : 'Download as PNG'}
        </button>
      </div>

      {/* --- Lienzo del Diseñador --- */}
      <div className="flex-1 h-fit bg-gray-700 p-4 rounded-lg flex items-center justify-center" onClick={() => setSelectedElementId(null)}>
        <div ref={canvasRef} style={{ width: mmToPx(Number(canvasSize.width) || 0), height: mmToPx(Number(canvasSize.height) || 0) }} className="relative bg-white shadow-lg" onClick={e => e.stopPropagation()}>
          {elements.map(el => (
            <Rnd
              key={el.id}
              size={{ width: el.width, height: el.height }}
              position={{ x: el.x, y: el.y }}
              onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
              onResizeStop={(e, direction, ref, delta, position) => {
                updateElement(el.id, { width: parseInt(ref.style.width), height: parseInt(ref.style.height), ...position });
              }}
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedElementId(el.id); }}
              className={selectedElementId === el.id ? 'border-2 border-blue-500 z-10' : 'border border-dashed border-transparent hover:border-blue-300'}
              bounds="parent"
            >
              <ElementRenderer element={el} />
            </Rnd>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Componentes Hijos (Renderizado y Propiedades) ---

const ElementRenderer = ({ element }: { element: DesignerElement }) => {
    const { type, props, width, height } = element;
    switch (type) {
        case 'text':
            const textProps = props as TextProps;
            return <div style={{ fontSize: textProps.fontSize, fontWeight: textProps.fontWeight, color: textProps.color, wordBreak: textProps.wordWrap ? 'break-word' : 'normal' }} className="p-1 w-full h-full flex items-center justify-center text-center">{textProps.dataField}</div>;
        case 'image':
            return <img src={(props as ImageProps).src} alt="label element" className="w-full h-full object-contain pointer-events-none" />;
        case 'qr':
            const qrProps = props as QrProps;
            const qrValue = qrProps.isEncoded ? btoa(qrProps.formatString) : qrProps.formatString;
            return <div className="p-1 bg-white w-full h-full"><QRCode value={qrValue} style={{ width: '100%', height: '100%' }} /></div>;
        case 'barcode':
             return <div className="p-1 bg-white w-full h-full flex items-center justify-center"><Barcode value={(props as BarcodeProps).dataFieldString} height={height-10} width={1.5} fontSize={12} /></div>;
    }
};

const PropertiesPanel = ({ element, onUpdate }: { element: DesignerElement, onUpdate: (id: string, updates: Partial<DesignerElement>) => void }) => {
    const updateProps = (propUpdates: any) => {
        onUpdate(element.id, { props: { ...element.props, ...propUpdates }});
    }

    switch(element.type) {
        case 'text':
            const textProps = element.props as TextProps;
            return (
                <div className="space-y-4">
                  <div>
                        <label className="text-sm">Data Field</label>
                        <select value={textProps.dataField} onChange={e => updateProps({ dataField: e.target.value })} className="w-full bg-gray-800 p-1 rounded">
                            {AVAILABLE_FIELDS.map(f => <option key={f} value={`{${f}}`}>{`{${f}}`}</option>)}
                        </select>
                    </div>
                    <div><label className="text-sm">Content</label><input type="text" value={textProps.dataField} onChange={e => updateProps({ content: e.target.value })} className="w-full bg-gray-800 p-1 rounded" /></div>
                    <div><label className="text-sm">Font Size (px)</label><input type="number" value={textProps.fontSize} onChange={e => updateProps({ fontSize: +e.target.value })} className="w-full bg-gray-800 p-1 rounded" /></div>
                    <div><label className="text-sm">Font Color</label><input type="color" value={textProps.color} onChange={e => updateProps({ color: e.target.value })} className="w-full bg-gray-800 rounded h-8" /></div>
                    <div><label className="text-sm">Font Weight</label><select value={textProps.fontWeight} onChange={e => updateProps({ fontWeight: e.target.value })} className="w-full bg-gray-800 p-1 rounded"><option value="normal">Normal</option><option value="bold">Bold</option></select></div>
                    <div className="flex items-center gap-2"><input type="checkbox" checked={textProps.wordWrap} onChange={e => updateProps({ wordWrap: e.target.checked })} /><label className="text-sm">Word Wrap</label></div>
                </div>
            );
        case 'image':
             const imageProps = element.props as ImageProps;
            return <div><label className="text-sm">Image URL</label><input type="text" value={imageProps.src} onChange={e => updateProps({ src: e.target.value })} className="w-full bg-gray-800 p-1 rounded" /></div>
        case 'qr':
            const qrProps = element.props as QrProps;
            return (
                <div className="space-y-4">
                  <div>
                        <label className="text-sm">Data Format String</label>
                        <textarea value={qrProps.formatString} onChange={e => updateProps({ formatString: e.target.value })} className="w-full bg-gray-800 p-1 rounded text-xs" rows={3} />
                        <p className="text-xs text-gray-500 mt-1">Use placeholders like {'{clave}'}, {'{descripcion}'}, etc. to combine data.</p>
                    </div>
                    <div><label className="text-sm">Data Placeholder</label><input type="text" value={qrProps.formatString} onChange={e => updateProps({ placeholder: e.target.value })} className="w-full bg-gray-800 p-1 rounded" /><p className="text-xs text-gray-500 mt-1">Use {'{clave}'}, etc.</p></div>
                    <div className="flex items-center gap-2"><input type="checkbox" checked={qrProps.isEncoded} onChange={e => updateProps({ isEncoded: e.target.checked })} /><label className="text-sm">Encode (Base64)</label></div>
                </div>
            )
        case 'barcode':
            const codeProps = element.props as BarcodeProps;
            return (
              <div>
                    <label className="text-sm">Data Field</label>
                    <input type="text" value={codeProps.dataFieldString} onChange={e => updateProps({ dataField: e.target.value })} className="w-full bg-gray-800 p-1 rounded" />
                    <p className="text-xs text-gray-500 mt-1">Combine placeholders, e.g., {'{clave}-{año}'}</p>
                </div>  
            )
    }
};