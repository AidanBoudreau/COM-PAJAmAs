"use client";

import ClientCard from "./ClientCard";
import type { ClientRecord } from "@/lib/dynamodb";
import "./ClientList.css";

interface ClientListProps {
  clients: ClientRecord[];
}

export default function ClientList({ clients }: ClientListProps) {
  if (clients.length === 0) {
    return <p className="client-list-empty">No clients found.</p>;
  }

  return (
    <div className="client-list">
      {clients.map((client) => (
        <ClientCard key={client.clientId} client={client} />
      ))}
    </div>
  );
}
