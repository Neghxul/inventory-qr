// src/components/generator/ColumnMapper.tsx
"use client";

import { useState } from 'react';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';

interface ColumnMapperProps {
  headers: string[];
  onMappingComplete: (mapping: Record<string, string>) => void;
}

const APP_FIELDS = ["Clave", "Año", "Pedimento", "Descripción", "Línea", "Estante", "Posición", "Tipo"];

export default function ColumnMapper({ headers, onMappingComplete }: ColumnMapperProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({});

  const handleSelectChange = (appField: string, excelHeader: string) => {
    setMapping(prev => ({ ...prev, [appField]: excelHeader }));
  };

  const isComplete = APP_FIELDS.filter(f => ['Clave', 'Año', 'Pedimento', 'Tipo'].includes(f))
                               .every(f => Object.keys(mapping).includes(f) && mapping[f]);

  return (
    <div className="mt-6 border-t border-gray-700 pt-6">
      <h2 className="text-lg font-bold mb-4 text-white">2. Map your columns</h2>
      <p className="text-sm text-gray-400 mb-4">
        Match the required fields from the application with the column headers from your Excel file.
      </p>
      <div className="space-y-4">
        {APP_FIELDS.map(field => (
          <div key={field} className="grid grid-cols-3 items-center gap-4">
            <span className="font-semibold text-right text-gray-300">
              {field}{['Clave', 'Año', 'Pedimento', 'Tipo'].includes(field) && <span className="text-red-500">*</span>}
            </span>
            <FiArrowRight className="text-gray-500 mx-auto" />
            <select 
              onChange={(e) => handleSelectChange(field, e.target.value)}
              className="block w-full rounded-md bg-gray-800 border-gray-600 text-white p-2 text-sm"
              value={mapping[field] || ""}
            >
              <option value="" disabled>Select a column...</option>
              {headers.map(header => (
                <option key={header} value={header}>{header}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div className="mt-6 text-right">
          <button 
            onClick={() => onMappingComplete(mapping)} 
            disabled={!isComplete}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
              <FiCheckCircle />
              Confirm Mapping & Preview
          </button>
      </div>
    </div>
  );
}