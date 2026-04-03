"use client";

import { useState, useEffect, useCallback } from "react";
import { Download } from "lucide-react";
import ReportTable from "@/components/ReportTable";
import type { ReportRow } from "@/components/ReportTable";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getClientsByDateRange } from "@/lib/apiClient";
import "./reports.css";

export default function ReportsPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [rows, setRows] = useState<ReportRow[]>([]);
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
        const purpose = client.purpose || "Other";
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
          totalAmount: data.totalAmount,
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount);

      setRows(reportRows);
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
            <button className="reports-download-btn" onClick={downloadCSV}>
              <Download size={16} /> CSV
            </button>
          )}
        </div>
      </div>

      {isLoading && <LoadingSpinner />}
      {!isLoading && error && <p className="reports-error">{error}</p>}
      {!isLoading && !error && <ReportTable rows={rows} year={year} />}
    </div>
  );
}
