"use client";
import { useState } from "react";
import "./ClientCard.css";
import { SquarePen, Save, CircleX } from 'lucide-react';

type Client = {
  slug: string;
  name: string;
  contactEmail: string;
  lastAssisted: string;
  totalReceived: number;
};

export default function ClientCard({ client }: { client: Client }) {
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: client.name,
    contactEmail: client.contactEmail,
    lastAssisted: client.lastAssisted,
    totalReceived: client.totalReceived.toString(),
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleEdit() {
    setEditing(true);
  }

  function handleCancel() {
    setFormData({
      name: client.name,
      contactEmail: client.contactEmail,
      lastAssisted: client.lastAssisted,
      totalReceived: client.totalReceived.toString(),
    });
    setEditing(false);
  }

  function handleSave() {
    console.log("Saved:", {
      ...formData,
      totalReceived: Number(formData.totalReceived),
    });

    setEditing(false);
  }

  const formattedTotal = Number(formData.totalReceived || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div className="client-page">
      <div className="client-card">
        <div className="client-header">
          <div>
            <h1 className="client-title">{formData.name}'s Information</h1>
          </div>

          {!editing && (
            <button className="icon-btn" onClick={handleEdit}>
              <SquarePen />
            </button>
          )}
        </div>

        <div className="client-fields">
          <div className="client-field">
            <label>Name</label>
            {editing ? (
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            ) : (
              <p>{formData.name}</p>
            )}
          </div>

          <div className="client-field">
            <label>Email</label>
            {editing ? (
              <input
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
              />
            ) : (
              <p>{formData.contactEmail}</p>
            )}
          </div>

          <div className="client-field">
            <label>Last Assisted</label>
            {editing ? (
              <input
                name="lastAssisted"
                value={formData.lastAssisted}
                onChange={handleChange}
              />
            ) : (
              <p>{formData.lastAssisted}</p>
            )}
          </div>

          <div className="client-field">
            <label>Total Received</label>
            {editing ? (
              <input
                type="number"
                name="totalReceived"
                value={formData.totalReceived}
                onChange={handleChange}
              />
            ) : (
              <p>{formattedTotal}</p>
            )}
          </div>
        </div>

        {editing && (
          <div className="client-footer">
            <button className="btn-secondary" onClick={handleCancel}>
              <CircleX />
            </button>
            <button className="btn-primary" onClick={handleSave}>
              <Save />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}