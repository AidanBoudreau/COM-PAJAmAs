"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import EligibilityBadge from "./EligibilityBadge";
import type { ClientRecord } from "@/lib/dynamodb";
import type { EligibilityResult } from "@/lib/apiClient";
import "./ClientCard.css";

interface ClientCardProps {
  client: ClientRecord;
  eligibility: EligibilityResult | null;
}

export default function ClientCard({ client, eligibility }: ClientCardProps) {
  return (
    <Link href={`/clients/${client.clientId}`} className="client-card">
      <div className="client-card-info">
        <div className="client-card-name">
          {client.firstName} {client.lastName}
        </div>
        <div className="client-card-details">
          <span>dob: {client.dob}</span>
          <span className="client-card-separator">|</span>
          <span>${client.amount.toFixed(2)}</span>
          <span className="client-card-separator">|</span>
          <span>{client.purpose}</span>
        </div>
        <div className="client-card-meta">
          <span>Last helped: {client.lastHelpedDate}</span>
          <EligibilityBadge eligibility={eligibility} />
        </div>
      </div>
      <ChevronRight size={20} className="client-card-chevron" />
    </Link>
  );
}
