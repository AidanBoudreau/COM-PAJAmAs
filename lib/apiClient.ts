import type { ClientRecord } from "./dynamodb";

export interface EligibilityResult {
  eligible: boolean;
  daysSinceLastHelp: number;
  daysRemaining: number;
  nextEligibleDate: string;
}

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiError {
  success: false;
  error: string;
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, credentials: "include" });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) {
    throw new Error(json.error);
  }
  return json.data;
}

export async function searchClients(lastName: string, DOB: string): Promise<ClientRecord[]> {
  const params = new URLSearchParams({ lastName, DOB });
  return apiFetch<ClientRecord[]>(`/api/clients/search?${params}`);
}

export async function searchClientById(clientId: string): Promise<ClientRecord[]> {
  const params = new URLSearchParams({ clientId });
  return apiFetch<ClientRecord[]>(`/api/clients/search?${params}`);
}

export async function getClient(clientId: string): Promise<ClientRecord> {
  return apiFetch<ClientRecord>(`/api/clients/${clientId}`);
}

export async function getEligibility(clientId: string): Promise<EligibilityResult> {
  return apiFetch<EligibilityResult>(`/api/clients/${clientId}/eligibility`);
}

export async function createClient(data: {
  firstName: string;
  lastName: string;
  DOB: string;
  amount: number;
  purpose: string;
  lastHelpedDate: string;
}): Promise<ClientRecord> {
  return apiFetch<ClientRecord>("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateClient(
  clientId: string,
  data: Partial<Omit<ClientRecord, "clientId">>,
): Promise<ClientRecord> {
  return apiFetch<ClientRecord>(`/api/clients/${clientId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function recordHelp(
  clientId: string,
  data: { lastHelpedDate: string; amount?: number; purpose?: string },
): Promise<ClientRecord> {
  return apiFetch<ClientRecord>(`/api/clients/${clientId}/help`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function getClientsByDateRange(
  start: string,
  end: string,
): Promise<ClientRecord[]> {
  const params = new URLSearchParams({ start, end });
  return apiFetch<ClientRecord[]>(`/api/clients/by-date-range?${params}`);
}
