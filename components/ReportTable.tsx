"use client";

import "./ReportTable.css";

export interface ReportRow {
  purpose: string;
  clientCount: number;
  totalAmount: number;
}

interface ReportTableProps {
  rows: ReportRow[];
  year: number;
}

export default function ReportTable({ rows, year }: ReportTableProps) {
  const grandTotalClients = rows.reduce((sum, r) => sum + r.clientCount, 0);
  const grandTotalAmount = rows.reduce((sum, r) => sum + r.totalAmount, 0);

  return (
    <div className="report-table-wrapper">
      <table className="report-table">
        <thead>
          <tr>
            <th colSpan={3} className="report-year-header">{year} Report</th>
          </tr>
          <tr>
            <th>Category (Purpose)</th>
            <th>Clients Helped</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={3} className="report-empty">No data for this year.</td>
            </tr>
          ) : (
            <>
              {rows.map((row) => (
                <tr key={row.purpose}>
                  <td>{row.purpose}</td>
                  <td className="report-number">{row.clientCount}</td>
                  <td className="report-number">${row.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="report-total-row">
                <td><strong>Total</strong></td>
                <td className="report-number"><strong>{grandTotalClients}</strong></td>
                <td className="report-number"><strong>${grandTotalAmount.toFixed(2)}</strong></td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
