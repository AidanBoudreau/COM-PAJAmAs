"use client";

import { useState, useEffect, useCallback } from "react";
import { Download } from "lucide-react";
import ReportTable from "@/components/ReportTable";
import type { ReportRow } from "@/components/ReportTable";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getClientsByDateRange } from "@/lib/apiClient";
import "./reports.css";

const UTILITY_ACCOUNT_PATTERN = /[a-z0-9]{3,4}[-\u2010-\u2015][a-z0-9]{4}[-\u2010-\u2015][a-z0-9]{4}/i;

function normalizeReportPurpose(purpose: string | undefined): string {
  const trimmed = purpose?.trim();
  if (!trimmed) return "Other";

  return UTILITY_ACCOUNT_PATTERN.test(trimmed) ? "utilities" : trimmed;
}

function roundToCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function escapePdfText(value: string): string {
  return value
    .replace(/[^\x20-\x7E]/g, "-")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function truncatePdfText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3)}...`;
}

function pdfText(
  text: string,
  x: number,
  y: number,
  size: number,
  font = "F1",
  color = "0.10 0.16 0.18",
): string {
  return `${color} rg BT /${font} ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`;
}

function pdfRightText(
  text: string,
  x: number,
  y: number,
  size: number,
  font = "F1",
  color = "0.10 0.16 0.18",
): string {
  const width = text.length * size * 0.55;
  return pdfText(text, x - width, y, size, font, color);
}

function pdfRect(
  x: number,
  y: number,
  width: number,
  height: number,
  fillColor: string,
): string {
  return `${fillColor} rg ${x} ${y} ${width} ${height} re f`;
}

function generateReportPdf(rows: ReportRow[], year: number): Blob {
  const pageWidth = 612;
  const pageHeight = 792;
  const grandClients = rows.reduce((sum, row) => sum + row.clientCount, 0);
  const grandAmount = rows.reduce((sum, row) => sum + row.totalAmount, 0);
  const generatedDate = new Date().toLocaleDateString();
  const rowsPerPage = 22;
  const pages: string[] = [];

  for (let start = 0; start < rows.length || start === 0; start += rowsPerPage) {
    const pageRows = rows.slice(start, start + rowsPerPage);
    const commands: string[] = [
      pdfRect(0, 0, pageWidth, pageHeight, "1 1 1"),
      pdfRect(0, 724, pageWidth, 68, "0.04 0.45 0.41"),
      pdfText("CareLedger Report", 48, 758, 22, "F2", "1 1 1"),
      pdfText(`${year} Assistance Summary`, 48, 738, 12, "F1", "1 1 1"),
      pdfRightText(`Generated ${generatedDate}`, 564, 758, 10, "F1", "1 1 1"),
    ];

    if (start === 0) {
      commands.push(
        pdfRect(48, 658, 240, 44, "0.94 0.98 0.97"),
        pdfRect(324, 658, 240, 44, "0.94 0.98 0.97"),
        pdfText("Clients Helped", 64, 684, 10, "F2"),
        pdfText(String(grandClients), 64, 666, 16, "F2"),
        pdfText("Total Amount", 340, 684, 10, "F2"),
        pdfText(`$${grandAmount.toFixed(2)}`, 340, 666, 16, "F2"),
      );
    }

    const tableTop = start === 0 ? 620 : 680;
    commands.push(
      pdfRect(48, tableTop, 516, 28, "0.08 0.57 0.51"),
      pdfText("Category", 62, tableTop + 10, 10, "F2", "1 1 1"),
      pdfRightText("Clients", 430, tableTop + 10, 10, "F2", "1 1 1"),
      pdfRightText("Amount", 548, tableTop + 10, 10, "F2", "1 1 1"),
    );

    let y = tableTop - 24;
    pageRows.forEach((row, index) => {
      const fill = index % 2 === 0 ? "0.98 0.99 0.99" : "1 1 1";
      commands.push(
        pdfRect(48, y - 6, 516, 24, fill),
        "0.88 0.91 0.92 RG 48 " + (y - 6) + " 516 24 re S",
        pdfText(truncatePdfText(row.purpose, 48), 62, y + 2, 10),
        pdfRightText(String(row.clientCount), 430, y + 2, 10),
        pdfRightText(`$${row.totalAmount.toFixed(2)}`, 548, y + 2, 10),
      );
      y -= 24;
    });

    if (start + rowsPerPage >= rows.length) {
      commands.push(
        pdfRect(48, y - 6, 516, 26, "0.94 0.98 0.97"),
        pdfText("Total", 62, y + 3, 11, "F2"),
        pdfRightText(String(grandClients), 430, y + 3, 11, "F2"),
        pdfRightText(`$${grandAmount.toFixed(2)}`, 548, y + 3, 11, "F2"),
      );
    }

    commands.push(
      pdfRightText(`Page ${pages.length + 1}`, 564, 36, 9),
      pdfText("Generated from the current edited report rows.", 48, 36, 9),
    );
    pages.push(commands.join("\n"));
  }

  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`,
  ];

  pages.forEach((page, index) => {
    const pageObjectNumber = 3 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> /Contents ${contentObjectNumber} 0 R >>`,
      `<< /Length ${page.length} >>\nstream\n${page}\nendstream`,
    );
  });

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export default function ReportsPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [originalRows, setOriginalRows] = useState<ReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const yearOptions: number[] = [];
  for (let y = currentYear; y >= currentYear - 10; y--) {
    yearOptions.push(y);
  }

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const clients = await getClientsByDateRange(`${year}-01-01`, `${year}-12-31`);

      const grouped: Record<string, { clientIds: Set<string>; totalAmount: number }> = {};
      for (const client of clients) {
        const purpose = normalizeReportPurpose(client.purpose);
        if (!grouped[purpose]) {
          grouped[purpose] = { clientIds: new Set(), totalAmount: 0 };
        }
        grouped[purpose].clientIds.add(client.clientId);
        grouped[purpose].totalAmount += client.amount;
      }

      const reportRows: ReportRow[] = Object.entries(grouped)
        .map(([purpose, data]) => ({
          purpose,
          clientCount: data.clientIds.size,
          totalAmount: roundToCents(data.totalAmount),
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount);

      setRows(reportRows);
      setOriginalRows(reportRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report.");
    } finally {
      setIsLoading(false);
    }
  }, [year]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  function downloadCSV() {
    const header = "Category,Clients Helped,Total Amount\n";
    const body = rows
      .map((r) => `"${r.purpose}",${r.clientCount},${r.totalAmount.toFixed(2)}`)
      .join("\n");

    const grandClients = rows.reduce((s, r) => s + r.clientCount, 0);
    const grandAmount = rows.reduce((s, r) => s + r.totalAmount, 0);
    const footer = `\n"Total",${grandClients},${grandAmount.toFixed(2)}`;

    const blob = new Blob([header + body + footer], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `careledger-report-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadPDF() {
    const blob = generateReportPdf(rows, year);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `careledger-report-${year}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>Reports</h1>
        <div className="reports-controls">
          <select
            className="reports-year-select"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          {rows.length > 0 && (
            <>
              <button className="reports-download-btn" onClick={downloadCSV}>
                <Download size={16} /> CSV
              </button>
              <button className="reports-download-btn" onClick={downloadPDF}>
                <Download size={16} /> PDF
              </button>
            </>
          )}
        </div>
      </div>

      {isLoading && <LoadingSpinner />}
      {!isLoading && error && <p className="reports-error">{error}</p>}
      {!isLoading && !error && (
        <ReportTable
          rows={rows}
          year={year}
          onRowsChange={setRows}
          onResetRows={() => setRows(originalRows)}
        />
      )}
    </div>
  );
}
