"use client";

import { useState } from "react";
import "./invite.css";

export default function InviteCollaboratorsPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    department: "",
    accessLevel: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Invite submitted:", formData);
  }

  return (
    <div className="invite-page">
      <div className="invite-card">
        <div className="invite-header">
          <div>
            <h1 className="invite-title">Invite Collaborator</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="invite-form">
          <div className="invite-fields">
            <div className="invite-field">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Jane Doe"
              />
            </div>

            <div className="invite-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@email.com"
              />
            </div>

            <div className="invite-field">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="">Select role</option>
                <option value="admin">Admin</option>
                <option value="manager">Helper</option>
              </select>
            </div>
          </div>

          <div className="invite-footer">
            <button type="submit" className="primary-btn">
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}