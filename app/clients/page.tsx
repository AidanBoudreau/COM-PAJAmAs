"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { UserRoundPlus, ChevronRight } from "lucide-react";
import ClientSearchForm from "@/components/ClientSearchForm";
import ClientList from "@/components/ClientList";
import LoadingSpinner from "@/components/LoadingSpinner";
import { searchClients, getAllClients } from "@/lib/apiClient";
import type { ClientRecord } from "@/lib/dynamodb";
import "./clients.css";

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [allClients, setAllClients] = useState<ClientRecord[]>([]);

  useEffect(() => {
    getAllClients().then((data) => {
      const sorted = [...data].sort((a, b) =>
        a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)
      );
      setAllClients(sorted);
    }).catch(() => {});
  }, []);

  const groupedClients = useMemo(() => {
    const groups: { letter: string; clients: ClientRecord[] }[] = [];
    const misc: ClientRecord[] = [];

    for (const client of allClients) {
      const first = client.lastName.charAt(0).toUpperCase();
      const isLetter = first >= "A" && first <= "Z";
      if (!isLetter) {
        misc.push(client);
        continue;
      }
      const existing = groups.find((g) => g.letter === first);
      if (existing) {
        existing.clients.push(client);
      } else {
        groups.push({ letter: first, clients: [client] });
      }
    }

    if (misc.length > 0) {
      groups.push({ letter: "#", clients: misc });
    }

    return groups;
  }, [allClients]);

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
        <ClientList clients={clients} />
      )}

      {!hasSearched && (
        <p className="clients-hint">Search for clients by last name and date of birth.</p>
      )}

      {groupedClients.length > 0 && (
        <div className="all-clients-list">
          <h2 className="all-clients-title">All Clients</h2>
          <div className="all-clients-scroll">
            {groupedClients.map(({ letter, clients: group }) => (
              <div key={letter} className="all-clients-group">
                <div className="all-clients-letter">{letter}</div>
                <div className="all-clients-group-rows">
                  {group.map((client) => (
                    <Link
                      key={client.clientId}
                      href={`/clients/${client.clientId}`}
                      className="all-clients-row"
                    >
                      <div className="all-clients-row-info">
                        <span className="all-clients-name">{client.lastName}, {client.firstName}</span>
                        <span className="all-clients-dob">DOB: {client.dob}</span>
                      </div>
                      <ChevronRight size={18} className="all-clients-chevron" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
