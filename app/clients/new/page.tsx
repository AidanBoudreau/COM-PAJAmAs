"use client";

import { useState } from "react";
import "./AddClient.css";

export default function AddClientPage() {
  const [formData, setFormData] = useState({
    name: "",
    contactEmail: "",
    phone: "",
    company: "",
    lastAssisted: "",
    totalReceived: "",
    notes: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    console.log("New client:", {
      ...formData,
      totalReceived: Number(formData.totalReceived || 0),
    });
  }

  return (
    <div className="add-client-page">
      <div className="add-client-card">
        <div className="add-client-header">
          <div>
            <h1 className="add-client-title">Add Client</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="add-client-form">
          <div className="add-client-fields">
            <div className="add-client-field">
              <label htmlFor="name">Client Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Smith"
              />
            </div>

            <div className="add-client-field">
              <label htmlFor="contactEmail">Email</label>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="john@email.com"
              />
            </div>

            <div className="add-client-field full">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add anything helpful about this client..."
                rows={5}
              />
            </div>
          </div>

          <div className="add-client-footer">
            <button type="submit" className="primary-btn">
              Save Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}