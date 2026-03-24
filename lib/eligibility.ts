import { ValidationError, isValidDateString } from "@/lib/validation";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const ELIGIBILITY_WINDOW_DAYS = 365;

export interface EligibilityResult {
  eligible: boolean;
  daysSinceLastHelp: number;
  daysRemaining: number;
  nextEligibleDate: string;
}

function parseDateAtUtcMidnight(value: string): number {
  if (!isValidDateString(value)) {
    throw new ValidationError("lastHelpedDate must be a valid date in YYYY-MM-DD format.");
  }

  return Date.parse(`${value}T00:00:00.000Z`);
}

function toIsoDate(utcTimestamp: number) {
  return new Date(utcTimestamp).toISOString().slice(0, 10);
}

export function calculateEligibility(
  lastHelpedDate: string,
  eligibilityWindowDays: number,
  today = new Date(),
): EligibilityResult {
  if (!Number.isInteger(eligibilityWindowDays) || eligibilityWindowDays <= 0) {
    throw new ValidationError("eligibilityWindowDays must be a positive integer.");
  }

  if (lastHelpedDate === "0000-00-00") {
    return {
      eligible: true,
      daysSinceLastHelp: Infinity,
      daysRemaining: 0,
      nextEligibleDate: "0000-00-00",
    };
  }

  const lastHelpedUtc = parseDateAtUtcMidnight(lastHelpedDate);
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const daysSinceLastHelp = Math.floor((todayUtc - lastHelpedUtc) / MS_PER_DAY);
  const eligible = daysSinceLastHelp >= eligibilityWindowDays;
  const daysRemaining = eligible ? 0 : eligibilityWindowDays - daysSinceLastHelp;
  const nextEligibleDate = toIsoDate(lastHelpedUtc + eligibilityWindowDays * MS_PER_DAY);

  return {
    eligible,
    daysSinceLastHelp,
    daysRemaining,
    nextEligibleDate,
  };
}
