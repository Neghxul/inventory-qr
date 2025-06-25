"use client";

import { FiTrash2 } from "react-icons/fi";
import { ScanData } from "@/types";

interface Props {
  records: ScanData[];
  onDelete: (id: number) => void;
}

export default function ScanTable({ records, onDelete }: Props) {
  if (!records.length) return null;

  return (
    <div className="bg-gray-800 p-4 rounded-lg overflow-x-auto">
      <h3 className="font-semibold mb-3">Scanned Records</h3>
      <table className="min-w-full text-sm border border-gray-700">
        <thead className="bg-gray-900">
          <tr>
            <th className="px-2 py-1 border">Key</th>
            <th className="px-2 py-1 border">Pedimento</th>
            <th className="px-2 py-1 border">Description</th>
            <th className="px-2 py-1 border">Shelf</th>
            <th className="px-2 py-1 border">Position</th>
            <th className="px-2 py-1 border">Type</th>
            <th className="px-2 py-1 border">Encoded</th>
            <th className="px-2 py-1 border">Delete</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="text-center border-t border-gray-700">
              <td className="border px-1 py-1">{r.key}</td>
              <td className="border px-1 py-1">{r.year}{r.pedimento}</td>
              <td className="border px-1 py-1">{r.description}</td>
              <td className="border px-1 py-1">{r.shelf}</td>
              <td className="border px-1 py-1">{r.position}</td>
              <td className="border px-1 py-1">{r.type}</td>
              <td className="border px-1 py-1">{r.encoded ? "Yes" : "No"}</td>
              <td className="border px-1 py-1">
                <button
                  onClick={() => typeof r.id === "number" && onDelete(r.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
