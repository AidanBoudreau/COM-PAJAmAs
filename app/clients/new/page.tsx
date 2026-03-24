"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/apiClient";
import "./new-client.css";

export default function NewClientPage() {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    amount: "",
    purpose: "",
    lastHelpedDate: today,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const result = await createClient({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dob: form.dob,
        amount: parseFloat(form.amount),
        purpose: form.purpose.trim(),
        lastHelpedDate: form.lastHelpedDate,
      });
      router.push(`/clients/${result.clientId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="new-client-page">
      <button className="new-client-back" onClick={() => router.back()}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="new-client-card">
        <h1>Add New Client</h1>

        <form onSubmit={handleSubmit}>
          <div className="new-client-grid">
            <div className="new-client-field">
              <label htmlFor="firstName">First Name *</label>
              <input
                id="firstName"
                type="text"
                placeholder="First name"
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                required
              />
            </div>
            <div className="new-client-field">
              <label htmlFor="lastName">Last Name *</label>
              <input
                id="lastName"
                type="text"
                placeholder="Last name"
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                required
              />
            </div>
            <div className="new-client-field">
              <label htmlFor="dob">Date of Birth *</label>
              <input
                id="dob"
                type="text"
                placeholder="MM-DD-YYYY"
                value={form.dob}
                onChange={(e) => updateField("dob", e.target.value)}
                required
              />
            </div>
            <div className="new-client-field">
              <label htmlFor="amount">Amount *</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Amount"
                value={form.amount}
                onChange={(e) => updateField("amount", e.target.value)}
                required
              />
            </div>
            <div className="new-client-field full-width">
              <label htmlFor="purpose">Purpose *</label>
              <input
                id="purpose"
                type="text"
                placeholder="e.g. rent, utilities, food"
                value={form.purpose}
                onChange={(e) => updateField("purpose", e.target.value)}
                required
              />
            </div>
            <div className="new-client-field full-width">
              <label htmlFor="lastHelpedDate">Last Helped Date *</label>
              <input
                id="lastHelpedDate"
                type="text"
                placeholder="MM-DD-YYYY"
                value={form.lastHelpedDate}
                onChange={(e) => updateField("lastHelpedDate", e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="new-client-error">{error}</p>}

          <button type="submit" className="new-client-submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Client"}
          </button>
        </form>
      </div>
    </div>
  );
}
