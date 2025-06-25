// src/components/generator/PreviewTable.tsx
"use client";

interface PreviewTableProps {
  previewData: any[];
  headers: string[];
}

export default function PreviewTable({ previewData, headers }: PreviewTableProps) {
  if (previewData.length === 0) return null;

  return (
    <div className="mt-6">
        <h3 className="text-md font-bold mb-2 text-white">Data Preview</h3>
        <div className="overflow-x-auto bg-gray-800/50 rounded-lg">
            <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-700/50">
                    <tr>
                        {headers.map(header => (
                            <th key={header} className="p-3">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {previewData.map((row, index) => (
                        <tr key={index}>
                            {headers.map(header => (
                                <td key={header} className="p-3 text-gray-300">{row[header]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {previewData.length > 5 && <p className="text-xs text-center text-gray-500 mt-2">...and more</p>}
    </div>
  );
}