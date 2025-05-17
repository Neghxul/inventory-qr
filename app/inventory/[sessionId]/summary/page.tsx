"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { exportToExcel, exportToPDF } from "@/lib/export-utils";
import { FiDownloadCloud, FiFileText } from "react-icons/fi";

interface Item {
  pedimento: string;
  quantity: number;
}

export default function SessionSummary() {
  const { sessionId } = useParams();
  const [summary, setSummary] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/inventory-item?sessionId=${sessionId}`);
        const data = await res.json();
        const grouped = groupByPedimento(data);
        setSummary(grouped);
        setTotal(data.length);
      } catch {
        setSummary([]);
      }
    };
    if (sessionId) fetchData();
  }, [sessionId]);

  const handleExcel = () => {
    exportToExcel(summary, "Inventory Summary", "inventory_summary");
  };

  const handlePDF = () => {
    exportToPDF(summary, "Inventory Summary", ["Pedimento", "Quantity"]);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4">
      <h1 className="text-xl font-bold mb-6 text-center">Inventory Summary</h1>
      <p className="mb-4 text-center">Total items scanned: <strong>{total}</strong></p>

      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={handleExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
        >
          <FiFileText /> Excel
        </button>
        <button
          onClick={handlePDF}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
        >
          <FiDownloadCloud /> PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2 border">Pedimento</th>
              <th className="p-2 border">Total Quantity</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((row, i) => (
              <tr key={i} className="text-center border-t border-gray-700">
                <td className="border px-2 py-1">{row.pedimento}</td>
                <td className="border px-2 py-1">{row.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function groupByPedimento(items: any[]): Item[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const p = item.pedimento;
    const q = item.quantity ?? 0;
    map.set(p, (map.get(p) || 0) + q);
  }
  return Array.from(map.entries()).map(([pedimento, quantity]) => ({ pedimento, quantity }));
}
