import React from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

export function exportCSV(rows, filename = "export.csv") {
  if (!rows || !rows.length) return;
  const cols = Object.keys(rows[0]);
  const csv = [cols.join(","), ...rows.map(r => cols.map(c => `"${String(r[c] ?? "")}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
}

export function exportXLSX(rows, filename = "export.xlsx") {
  if (!rows || !rows.length) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), filename);
}

export function exportPDF(rows, filename = "export.pdf") {
  const doc = new jsPDF();
  if (!rows || !rows.length) {
    doc.text("No data", 10, 10);
    doc.save(filename);
    return;
  }
  const cols = Object.keys(rows[0]);
  const lines = [cols.join(" | ")].concat(rows.map(r => cols.map(c => String(r[c] ?? "")).join(" | ")));
  let y = 10;
  for (const line of lines) {
    doc.text(line, 10, y);
    y += 8;
    if (y > 280) { doc.addPage(); y = 10; }
  }
  doc.save(filename);
}

export default function ExportButtons({ rows }) {
  if (!rows || !rows.length) return null;
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={() => exportCSV(rows)}>Export CSV</button>
      <button onClick={() => exportXLSX(rows)}>Export Excel</button>
      <button onClick={() => exportPDF(rows)}>Export PDF</button>
    </div>
  );
}
