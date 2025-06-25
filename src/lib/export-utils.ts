import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportToExcel<T>(rows: T[], sheetName: string, fileName: string) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  saveAs(blob, `${fileName}_${Date.now()}.xlsx`);
}

export function exportToPDF<T>(rows: T[], title: string, headers: string[]) {
  const doc = new jsPDF();
  doc.text(title, 14, 15);

  const body = rows.map((row: any) => headers.map((key) => row[key.toLowerCase()] ?? ""));

  autoTable(doc, {
    startY: 20,
    head: [headers],
    body,
    styles: { fontSize: 9 },
  });

  doc.save(`${title.replace(/\s+/g, "_").toLowerCase()}_${Date.now()}.pdf`);
}
