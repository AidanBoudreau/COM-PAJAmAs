"use client";

import "./EligibilityBadge.css";
import type { EligibilityResult } from "@/lib/apiClient";

interface EligibilityBadgeProps {
  eligibility: EligibilityResult | null;
}

export default function EligibilityBadge({ eligibility }: EligibilityBadgeProps) {
  if (!eligibility) {
    return <span className="eligibility-badge loading">...</span>;
  }

  if (eligibility.eligible) {
    return <span className="eligibility-badge eligible">Eligible</span>;
  }

  return (
    <span className="eligibility-badge ineligible">
      {eligibility.daysRemaining} days remaining
    </span>
  );
}
