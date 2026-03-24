"use client";

import { useState } from "react";
import Link from "next/link";
import { UserRoundPlus } from "lucide-react";
import ClientSearchForm from "@/components/ClientSearchForm";
import ClientList from "@/components/ClientList";
import LoadingSpinner from "@/components/LoadingSpinner";
import { searchClients, getEligibility } from "@/lib/apiClient";
import type { ClientRecord } from "@/lib/dynamodb";
import type { EligibilityResult } from "@/lib/apiClient";
import "./clients.css";

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [eligibilityMap, setEligibilityMap] = useState<Record<string, EligibilityResult | null>>({});
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

      const eligMap: Record<string, EligibilityResult | null> = {};
      const eligPromises = results.map(async (client) => {
        try {
          eligMap[client.clientId] = await getEligibility(client.clientId);
        } catch {
          eligMap[client.clientId] = null;
        }
      });
      await Promise.all(eligPromises);
      setEligibilityMap(eligMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="clients-page">
      <div className="clients-header">
        <h1>Clients</h1>
        <Link href="/clients/new" className="add-client-button">
          <UserRoundPlus size={18} />
          Add Client
        </Link>
      </div>

      <ClientSearchForm onSearch={handleSearch} isLoading={isLoading} />

      {error && <p className="clients-error">{error}</p>}

      {isLoading && <LoadingSpinner />}

      {!isLoading && hasSearched && (
        <ClientList clients={clients} eligibilityMap={eligibilityMap} />
      )}

      {!hasSearched && (
        <p className="clients-hint">Search for clients by last name and date of birth.</p>
      )}
    </div>
  );
}
