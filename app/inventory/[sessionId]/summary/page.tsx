"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ScanData } from "@/types";

export default function InventorySummaryPage() {
  const { sessionId } = useParams();
  const [records, setRecords] = useState<ScanData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/inventory?sessionId=${sessionId}`)
      .then((res) => res.json())
      .then((data) => setRecords(data))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div className="text-white p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Resumen de Inventario</h1>

      {loading ? (
        <p className="text-gray-400">Cargando datos...</p>
      ) : records.length === 0 ? (
        <p className="text-gray-400">No hay registros para esta sesión.</p>
      ) : (
        <table className="w-full text-sm border border-gray-700">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="border px-2">Clave</th>
              <th className="border px-2">Pedimento</th>
              <th className="border px-2">Descripción</th>
              <th className="border px-2">Línea</th>
              <th className="border px-2">Estante</th>
              <th className="border px-2">Posición</th>
              <th className="border px-2">Codificado</th>
              <th className="border px-2">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {records.map((item) => (
              <tr key={item.id} className="text-center">
                <td className="border px-1">{item.clave}</td>
                <td className="border px-1">{item.pedimento}</td>
                <td className="border px-1">{item.descripcion}</td>
                <td className="border px-1">{item.linea}</td>
                <td className="border px-1">{item.estante}</td>
                <td className="border px-1">{item.posicion}</td>
                <td className="border px-1">{item.codificado ? "Sí" : "No"}</td>
                <td className="border px-1">{item.tipo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
