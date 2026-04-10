"use client";

import { useState } from "react";
import Link from "next/link";
import { UserRoundPlus, CalendarRange, Search } from "lucide-react";
import ClientSearchForm from "@/components/ClientSearchForm";
import ClientList from "@/components/ClientList";
import LoadingSpinner from "@/components/LoadingSpinner";
import { searchClients } from "@/lib/apiClient";
import type { ClientRecord } from "@/lib/dynamodb";
import "./dashboard.css";

export default function Dashboard() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(lastName: string, dob: string, firstName?: string) {
    setIsLoading(true);
    setError("");
    setHasSearched(true);

    try {
      let results = await searchClients(lastName, dob);
      if (firstName) {
        results = results.filter((c) =>
          c.firstName.toLowerCase().includes(firstName.toLowerCase())
        );
      }
      setClients(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="dashboard-actions">
        <Link href="/clients/new" className="dashboard-action-card">
          <UserRoundPlus size={28} />
          <span>Add Client</span>
        </Link>
        <Link href="/calendar" className="dashboard-action-card">
          <CalendarRange size={28} />
          <span>Calendar</span>
        </Link>
        <Link href="/clients" className="dashboard-action-card">
          <Search size={28} />
          <span>Search Clients</span>
        </Link>
      </div>

      <h2 className="dashboard-section-title">Quick Search</h2>
      <ClientSearchForm onSearch={handleSearch} isLoading={isLoading} />

      {error && <p className="dashboard-error">{error}</p>}
      {isLoading && <LoadingSpinner />}
      {!isLoading && hasSearched && (
        <ClientList clients={clients} />
      )}
    </div>
  );
}
