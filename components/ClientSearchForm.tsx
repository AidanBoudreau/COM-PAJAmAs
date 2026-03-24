"use client";

import { useState } from "react";
import "./ClientSearchForm.css";

interface ClientSearchFormProps {
  onSearch: (lastName: string, DOB: string, firstName?: string) => void;
  isLoading: boolean;
}

export default function ClientSearchForm({ onSearch, isLoading }: ClientSearchFormProps) {
  const [lastName, setLastName] = useState("");
  const [DOB, setDOB] = useState("");
  const [firstName, setFirstName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lastName.trim() || !DOB) return;
    onSearch(lastName.trim(), DOB, firstName.trim() || undefined);
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-fields">
        <div className="search-field">
          <label htmlFor="lastName">Last Name *</label>
          <input
            id="lastName"
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="search-field">
          <label htmlFor="DOB">Date of Birth *</label>
          <input
            id="DOB"
            type="text"
            placeholder="MM-DD-YYYY"
            value={DOB}
            onChange={(e) => setDOB(e.target.value)}
            required
          />
        </div>
        <div className="search-field">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            type="text"
            placeholder="First name (optional)"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
      </div>
      <button type="submit" className="search-button" disabled={isLoading}>
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
