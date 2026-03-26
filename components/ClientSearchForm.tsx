"use client";

import { useState } from "react";
import { formatIsoDateInput } from "@/lib/dateInput";
import "./ClientSearchForm.css";

interface ClientSearchFormProps {
  onSearch: (lastName: string, dob: string, firstName?: string) => void;
  isLoading: boolean;
}

export default function ClientSearchForm({ onSearch, isLoading }: ClientSearchFormProps) {
  const [lastName, setLastName] = useState("");
  const [dob, setdob] = useState("");
  const [firstName, setFirstName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lastName.trim() || !dob) return;
    onSearch(lastName.trim(), dob, firstName.trim() || undefined);
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
          <label htmlFor="dob">Date of Birth *</label>
          <input
            id="dob"
            type="text"
            placeholder="YYYY-MM-DD (e.g. 0000-00-00)"
            value={dob}
            onChange={(e) => setdob(formatIsoDateInput(e.target.value))}
            inputMode="numeric"
            maxLength={10}
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
