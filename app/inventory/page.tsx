"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FiCheck, FiEdit2, FiX, FiDownloadCloud, FiFileText } from "react-icons/fi";
import { exportToExcel, exportToPDF } from "@/lib/export-utils";
import { useParams } from "next/navigation";

interface Item {
  id: string;
  key: string;
  pedimento: string;
  year: string;
  description: string;
  line: string;
  shelf: string;
  position: string;
  quantity: number | null;
  stock: number | null;
}

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const { sessionId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/inventory-item?sessionId=${sessionId}`);
        const data = await res.json();
        setItems(data);
      } catch {
        toast.error("Failed to load items");
      }
    };
    if (sessionId) fetchData();
  }, [sessionId]);

  const saveQuantity = async (id: string) => {
    try {
      const res = await fetch("/api/inventory-item", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, quantity: Number(editValue) }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: updated.quantity } : i))
      );
      toast.success("Quantity saved");
      setEditingId(null);
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleExportExcel = () => {
    exportToExcel(items, "Inventory Items", "inventory_session");
  };

  const handleExportPDF = () => {
    exportToPDF(items, "Inventory Items", [
      "Key",
      "Pedimento",
      "Description",
      "Shelf",
      "Position",
      "Stock",
      "Quantity",
    ]);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Inventory Session</h1>

      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
        >
          <FiFileText /> Excel
        </button>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
        >
          <FiDownloadCloud /> PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2 border">Key</th>
              <th className="p-2 border">Pedimento</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Shelf</th>
              <th className="p-2 border">Position</th>
              <th className="p-2 border">Stock</th>
              <th className="p-2 border">Quantity</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="text-center border-t border-gray-700">
                <td className="border px-2 py-1">{item.key}</td>
                <td className="border px-2 py-1">{item.year}{item.pedimento}</td>
                <td className="border px-2 py-1">{item.description}</td>
                <td className="border px-2 py-1">{item.shelf}</td>
                <td className="border px-2 py-1">{item.position}</td>
                <td className="border px-2 py-1">{item.stock ?? "-"}</td>
                <td className="border px-2 py-1">
                  {editingId === item.id ? (
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-20 p-1 rounded bg-gray-900 border border-gray-600 text-white"
                    />
                  ) : (
                    item.quantity ?? "-"
                  )}
                </td>
                <td className="border px-2 py-1">
                  {editingId === item.id ? (
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => saveQuantity(item.id)} className="text-green-400">
                        <FiCheck />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-red-400">
                        <FiX />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditValue(item.quantity?.toString() || "");
                      }}
                      className="text-blue-400"
                    >
                      <FiEdit2 />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
