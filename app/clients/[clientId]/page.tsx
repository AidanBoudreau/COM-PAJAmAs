"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, HandHeart } from "lucide-react";
import EligibilityBadge from "@/components/EligibilityBadge";
import Modal from "@/components/Modal";
import RecordHelpForm from "@/components/RecordHelpForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getClient, getEligibility, updateClient } from "@/lib/apiClient";
import { formatIsoDateInput } from "@/lib/dateInput";
import type { ClientRecord } from "@/lib/dynamodb";
import type { EligibilityResult } from "@/lib/apiClient";
import "./client-detail.css";

export default function ClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params);
  const router = useRouter();
  const [client, setClient] = useState<ClientRecord | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ClientRecord>>({});
  const [editError, setEditError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const clientData = await getClient(clientId);
        setClient(clientData);

        try {
          const eligData = await getEligibility(clientId);
          setEligibility(eligData);
        } catch {
          setEligibility(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load client.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [clientId]);

  function startEditing() {
    if (!client) return;
    setEditData({
      firstName: client.firstName,
      lastName: client.lastName,
      dob: client.dob,
      amount: client.amount,
      purpose: client.purpose,
    });
    setIsEditing(true);
    setEditError("");
  }

  async function saveEdit() {
    if (!client) return;
    setIsSaving(true);
    setEditError("");

    try {
      const updates: Record<string, unknown> = {};
      if (editData.firstName !== client.firstName) updates.firstName = editData.firstName;
      if (editData.lastName !== client.lastName) updates.lastName = editData.lastName;
      if (editData.dob !== client.dob) updates.dob = editData.dob;
      if (editData.amount !== client.amount) updates.amount = editData.amount;
      if (editData.purpose !== client.purpose) updates.purpose = editData.purpose;

      if (Object.keys(updates).length === 0) {
        setIsEditing(false);
        return;
      }

      const updated = await updateClient(clientId, updates);
      setClient(updated);
      setIsEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleHelpSuccess(updatedClient: ClientRecord) {
    setClient(updatedClient);
    setShowHelpModal(false);
    router.replace(`/clients/${updatedClient.clientId}`);
    getEligibility(updatedClient.clientId).then(setEligibility).catch(() => {});
  }

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="detail-page"><p className="detail-error">{error}</p></div>;
  if (!client) return <div className="detail-page"><p className="detail-error">Client not found.</p></div>;

  return (
    <div className="detail-page">
      <button className="detail-back" onClick={() => router.back()}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="detail-card">
        <div className="detail-header">
          <h1>{client.firstName} {client.lastName}</h1>
          <EligibilityBadge eligibility={eligibility} />
        </div>

        {!isEditing ? (
          <>
            <div className="detail-grid">
              <div className="detail-field">
                <span className="detail-label">First Name</span>
                <span className="detail-value">{client.firstName}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Last Name</span>
                <span className="detail-value">{client.lastName}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Date of Birth</span>
                <span className="detail-value">{client.dob}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Amount</span>
                <span className="detail-value">${client.amount.toFixed(2)}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Purpose</span>
                <span className="detail-value">{client.purpose}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Last Helped</span>
                <span className="detail-value">{client.lastHelpedDate}</span>
              </div>
            </div>

            {eligibility && !eligibility.eligible && (
              <div className="detail-eligibility-info">
                Next eligible: {eligibility.nextEligibleDate} ({eligibility.daysRemaining} days)
              </div>
            )}

            <div className="detail-actions">
              <button className="detail-edit-btn" onClick={startEditing}>
                <Pencil size={16} /> Edit
              </button>
              <button className="detail-help-btn" onClick={() => setShowHelpModal(true)}>
                <HandHeart size={16} /> Record Help
              </button>
            </div>
          </>
        ) : (
          <div className="detail-edit-form">
            <div className="detail-grid">
              <div className="detail-field">
                <label className="detail-label">First Name</label>
                <input
                  value={editData.firstName ?? ""}
                  onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                />
              </div>
              <div className="detail-field">
                <label className="detail-label">Last Name</label>
                <input
                  value={editData.lastName ?? ""}
                  onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                />
              </div>
              <div className="detail-field">
                <label className="detail-label">Date of Birth</label>
                <input
                  type="text"
                  placeholder="YYYY-MM-DD (e.g. 0000-00-00)"
                  value={editData.dob ?? ""}
                  onChange={(e) =>
                    setEditData({ ...editData, dob: formatIsoDateInput(e.target.value) })
                  }
                  inputMode="numeric"
                  maxLength={10}
                />
              </div>
              <div className="detail-field">
                <label className="detail-label">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={editData.amount ?? ""}
                  onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) })}
                />
              </div>
              <div className="detail-field">
                <label className="detail-label">Purpose</label>
                <input
                  value={editData.purpose ?? ""}
                  onChange={(e) => setEditData({ ...editData, purpose: e.target.value })}
                />
              </div>
            </div>
            {editError && <p className="detail-error">{editError}</p>}
            <div className="detail-actions">
              <button className="detail-cancel-btn" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button className="detail-save-btn" onClick={saveEdit} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>

      {showHelpModal && (
        <Modal title="Record Help" onClose={() => setShowHelpModal(false)}>
          <RecordHelpForm
            clientId={clientId}
            onSuccess={handleHelpSuccess}
            onCancel={() => setShowHelpModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}
