import { describe, expect, it } from "vitest";
import { calculateEligibility } from "@/lib/eligibility";

describe("calculateEligibility", () => {
  it("marks client eligible at the boundary", () => {
    const result = calculateEligibility("2025-03-11", 365, new Date("2026-03-11T12:00:00.000Z"));

    expect(result).toEqual({
      eligible: true,
      daysSinceLastHelp: 365,
      daysRemaining: 0,
      nextEligibleDate: "2026-03-11",
    });
  });

  it("marks client ineligible one day before boundary", () => {
    const result = calculateEligibility("2025-03-12", 365, new Date("2026-03-11T05:00:00.000Z"));

    expect(result).toEqual({
      eligible: false,
      daysSinceLastHelp: 364,
      daysRemaining: 1,
      nextEligibleDate: "2026-03-12",
    });
  });

  it("handles leap-year transitions", () => {
    const result = calculateEligibility("2024-02-29", 365, new Date("2025-02-28T00:00:00.000Z"));

    expect(result).toEqual({
      eligible: true,
      daysSinceLastHelp: 365,
      daysRemaining: 0,
      nextEligibleDate: "2025-02-28",
    });
  });
});
