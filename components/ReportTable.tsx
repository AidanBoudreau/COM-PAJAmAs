"use client";

import { useEffect, useState } from "react";
import "./ReportTable.css";

export interface ReportRow {
  purpose: string;
  clientCount: number;
  totalAmount: number;
}

interface ReportTableProps {
  rows: ReportRow[];
  year: number;
  onRowsChange: (rows: ReportRow[]) => void;
  onResetRows: () => void;
}

export default function ReportTable({ rows, year, onRowsChange, onResetRows }: ReportTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [mergeTarget, setMergeTarget] = useState("");
  const grandTotalClients = rows.reduce((sum, r) => sum + r.clientCount, 0);
  const grandTotalAmount = rows.reduce((sum, r) => sum + r.totalAmount, 0);
  const selectedRowCount = selectedRows.size;
  const mergeTargetIndex = parseInt(mergeTarget, 10);
  const canMerge =
    selectedRowCount > 0 && Number.isInteger(mergeTargetIndex) && !selectedRows.has(mergeTargetIndex);

  useEffect(() => {
    setSelectedRows(new Set());
    setMergeTarget("");
  }, [year]);

  function roundToCents(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  function updateRow(index: number, updates: Partial<ReportRow>) {
    onRowsChange(rows.map((row, i) => (i === index ? { ...row, ...updates } : row)));
  }

  function addRow() {
    onRowsChange([...rows, { purpose: "New category", clientCount: 0, totalAmount: 0 }]);
    clearMergeState();
  }

  function deleteRow(index: number) {
    onRowsChange(rows.filter((_, i) => i !== index));
    clearMergeState();
  }

  function clearMergeState() {
    setSelectedRows(new Set());
    setMergeTarget("");
  }

  function resetRows() {
    onResetRows();
    clearMergeState();
  }

  function toggleRowSelection(index: number) {
    setSelectedRows((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  function mergeSelectedRows() {
    if (!canMerge) {
      return;
    }

    const selected = rows.filter((_, index) => selectedRows.has(index));
    const mergedRow: ReportRow = {
      ...rows[mergeTargetIndex],
      clientCount:
        rows[mergeTargetIndex].clientCount + selected.reduce((sum, row) => sum + row.clientCount, 0),
      totalAmount: roundToCents(
        rows[mergeTargetIndex].totalAmount + selected.reduce((sum, row) => sum + row.totalAmount, 0),
      ),
    };

    onRowsChange(
      rows
        .map((row, index) => (index === mergeTargetIndex ? mergedRow : row))
        .filter((_, index) => !selectedRows.has(index)),
    );
    clearMergeState();
  }

  return (
    <div className="report-table-wrapper">
      <div className="report-table-toolbar">
        <div className="report-merge-controls">
          <select
            className="report-merge-target"
            value={mergeTarget}
            onChange={(e) => setMergeTarget(e.target.value)}
          >
            <option value="">Add selected to...</option>
            {rows.map((row, index) => (
              <option key={index} value={index} disabled={selectedRows.has(index)}>
                {row.purpose || `Row ${index + 1}`}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="report-merge-rows"
            onClick={mergeSelectedRows}
            disabled={!canMerge}
          >
            Add Selected
          </button>
          <button
            type="button"
            className="report-unselect-rows"
            onClick={clearMergeState}
            disabled={selectedRowCount === 0 && !mergeTarget}
          >
            Unselect All
          </button>
        </div>
        <button type="button" className="report-reset-rows" onClick={resetRows}>
          Reset to Original
        </button>
        <button type="button" className="report-add-row" onClick={addRow}>
          Add Row
        </button>
      </div>
      <table className="report-table">
        <thead>
          <tr>
            <th colSpan={5} className="report-year-header">{year} Report</th>
          </tr>
          <tr>
            <th>Select</th>
            <th>Category (Purpose)</th>
            <th>Clients Helped</th>
            <th>Total Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="report-empty">No data for this year.</td>
            </tr>
          ) : (
            <>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <input
                      className="report-select-row"
                      type="checkbox"
                      checked={selectedRows.has(index)}
                      onChange={() => toggleRowSelection(index)}
                    />
                  </td>
                  <td>
                    <input
                      className="report-input"
                      value={row.purpose}
                      onChange={(e) => updateRow(index, { purpose: e.target.value })}
                    />
                  </td>
                  <td className="report-number">
                    <input
                      className="report-input report-number-input"
                      type="number"
                      min="0"
                      step="1"
                      value={row.clientCount}
                      onChange={(e) =>
                        updateRow(index, { clientCount: Math.max(0, parseInt(e.target.value) || 0) })
                      }
                    />
                  </td>
                  <td className="report-number">
                    <input
                      className="report-input report-number-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.totalAmount}
                      onChange={(e) =>
                        updateRow(index, {
                          totalAmount: roundToCents(Math.max(0, parseFloat(e.target.value) || 0)),
                        })
                      }
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="report-delete-row"
                      onClick={() => deleteRow(index)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="report-total-row">
                <td />
                <td><strong>Total</strong></td>
                <td className="report-number"><strong>{grandTotalClients}</strong></td>
                <td className="report-number"><strong>${grandTotalAmount.toFixed(2)}</strong></td>
                <td />
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
