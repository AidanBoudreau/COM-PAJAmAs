"use client";

import { useState } from "react";
import { recordHelp } from "@/lib/apiClient";
import type { ClientRecord } from "@/lib/dynamodb";
import "./RecordHelpForm.css";

interface RecordHelpFormProps {
  clientId: string;
  onSuccess: (updatedClient: ClientRecord) => void;
  onCancel: () => void;
}

export default function RecordHelpForm({ clientId, onSuccess, onCancel }: RecordHelpFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [lastHelpedDate, setLastHelpedDate] = useState(today);
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const data: { lastHelpedDate: string; amount?: number; purpose?: string } = {
        lastHelpedDate,
      };
      if (amount) data.amount = parseFloat(amount);
      if (purpose.trim()) data.purpose = purpose.trim();

      const updated = await recordHelp(clientId, data);
      onSuccess(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record help.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="help-form" onSubmit={handleSubmit}>
      <div className="help-field">
        <label htmlFor="helpDate">Date Helped *</label>
        <input
          id="helpDate"
          type="text"
          placeholder="MM-DD-YYYY"
          value={lastHelpedDate}
          onChange={(e) => setLastHelpedDate(e.target.value)}
          required
        />
      </div>
      <div className="help-field">
        <label htmlFor="helpAmount">Amount</label>
        <input
          id="helpAmount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Amount (optional)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="help-field">
        <label htmlFor="helpPurpose">Purpose</label>
        <input
          id="helpPurpose"
          type="text"
          placeholder="Purpose (optional)"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
        />
      </div>
      {error && <p className="help-error">{error}</p>}
      <div className="help-actions">
        <button type="button" className="help-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="help-submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Record Help"}
        </button>
      </div>
    </form>
  );
}
