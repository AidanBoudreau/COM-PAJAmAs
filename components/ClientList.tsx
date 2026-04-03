"use client";

import ClientCard from "./ClientCard";
import type { ClientRecord } from "@/lib/dynamodb";
import type { EligibilityResult } from "@/lib/apiClient";
import "./ClientList.css";

interface ClientListProps {
  clients: ClientRecord[];
  eligibilityMap: Record<string, EligibilityResult | null>;
}

export default function ClientList({ clients, eligibilityMap }: ClientListProps) {
  if (clients.length === 0) {
    return <p className="client-list-empty">No clients found.</p>;
  }

  return (
    <div className="client-list">
      {clients.map((client) => (
        <ClientCard
          key={client.clientId}
          client={client}
          eligibility={eligibilityMap[client.clientId] ?? null}
        />
      ))}
    </div>
  );
}
