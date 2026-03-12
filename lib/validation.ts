export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export interface CreateClientInput {
  firstName: string;
  lastName: string;
  DOB: string;
  amount: number;
  purpose: string;
  lastHelpedDate: string;
}

export interface UpdateClientInput {
  firstName?: string;
  lastName?: string;
  DOB?: string;
  amount?: number;
  purpose?: string;
  lastHelpedDate?: string;
}

export interface HelpInput {
  lastHelpedDate: string;
  amount?: number;
  purpose?: string;
}

export interface EligibilityConfigInput {
  eligibilityWindowDays: number;
}

export interface CreateUserInput {
  email: string;
  password: string;
  role: "admin" | "staff";
}

interface SearchByIdInput {
  mode: "clientId";
  clientId: string;
}

interface SearchByNameDobInput {
  mode: "lastNameDOB";
  lastName: string;
  DOB: string;
}

export type SearchInput = SearchByIdInput | SearchByNameDobInput;

export function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function ensureObject(value: unknown, message: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ValidationError(message);
  }

  return value as Record<string, unknown>;
}

function parseRequiredString(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ValidationError(`${field} is required.`);
  }

  return value.trim();
}

function parseOptionalString(value: unknown, field: string) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" || value.trim() === "") {
    throw new ValidationError(`${field} must be a non-empty string when provided.`);
  }

  return value.trim();
}

function parsePositiveNumber(value: unknown, field: string) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new ValidationError(`${field} must be a positive number.`);
  }

  return value;
}

function parseOptionalPositiveNumber(value: unknown, field: string) {
  if (value === undefined) {
    return undefined;
  }

  return parsePositiveNumber(value, field);
}

function parseDate(value: unknown, field: string) {
  const parsed = parseRequiredString(value, field);
  if (!isValidDateString(parsed)) {
    throw new ValidationError(`${field} must be a valid date in YYYY-MM-DD format.`);
  }

  return parsed;
}

function parseOptionalDate(value: unknown, field: string) {
  if (value === undefined) {
    return undefined;
  }

  return parseDate(value, field);
}

function parseEmail(value: unknown, field: string) {
  const parsed = parseRequiredString(value, field).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed)) {
    throw new ValidationError(`${field} must be a valid email address.`);
  }

  return parsed;
}

export function validateCreateClientInput(payload: unknown): CreateClientInput {
  const body = ensureObject(payload, "Request body is required.");

  return {
    firstName: parseRequiredString(body.firstName, "firstName"),
    lastName: parseRequiredString(body.lastName, "lastName"),
    DOB: parseDate(body.DOB, "DOB"),
    amount: parsePositiveNumber(body.amount, "amount"),
    purpose: parseRequiredString(body.purpose, "purpose"),
    lastHelpedDate: parseDate(body.lastHelpedDate, "lastHelpedDate"),
  };
}

export function validateUpdateClientInput(payload: unknown): UpdateClientInput {
  const body = ensureObject(payload, "Request body is required.");
  const updates: UpdateClientInput = {
    firstName: parseOptionalString(body.firstName, "firstName"),
    lastName: parseOptionalString(body.lastName, "lastName"),
    DOB: parseOptionalDate(body.DOB, "DOB"),
    amount: parseOptionalPositiveNumber(body.amount, "amount"),
    purpose: parseOptionalString(body.purpose, "purpose"),
    lastHelpedDate: parseOptionalDate(body.lastHelpedDate, "lastHelpedDate"),
  };

  const hasAtLeastOneField = Object.values(updates).some((value) => value !== undefined);
  if (!hasAtLeastOneField) {
    throw new ValidationError("At least one updatable field must be provided.");
  }

  return updates;
}

export function validateHelpInput(payload: unknown): HelpInput {
  const body = ensureObject(payload, "Request body is required.");

  return {
    lastHelpedDate: parseDate(body.lastHelpedDate, "lastHelpedDate"),
    amount: parseOptionalPositiveNumber(body.amount, "amount"),
    purpose: parseOptionalString(body.purpose, "purpose"),
  };
}

export function validateEligibilityConfigInput(payload: unknown): EligibilityConfigInput {
  const body = ensureObject(payload, "Request body is required.");
  const value = body.eligibilityWindowDays;

  if (!Number.isInteger(value) || (value as number) <= 0) {
    throw new ValidationError("eligibilityWindowDays must be a positive integer.");
  }

  return { eligibilityWindowDays: value as number };
}

export function validateClientIdParam(clientId: string | undefined): string {
  if (!clientId || clientId.trim() === "") {
    throw new ValidationError("clientId is required.");
  }

  return clientId.trim();
}

export function validateUserIdParam(userId: string | undefined): string {
  if (!userId || userId.trim() === "") {
    throw new ValidationError("userId is required.");
  }

  return userId.trim();
}

export function validateCreateUserInput(payload: unknown): CreateUserInput {
  const body = ensureObject(payload, "Request body is required.");
  const email = parseEmail(body.email, "email");
  const password = parseRequiredString(body.password, "password");
  const role = parseRequiredString(body.role, "role");

  if (password.length < 8) {
    throw new ValidationError("password must be at least 8 characters long.");
  }

  if (role !== "admin" && role !== "staff") {
    throw new ValidationError("role must be either admin or staff.");
  }

  return {
    email,
    password,
    role,
  };
}

export function validateSearchInput(searchParams: URLSearchParams): SearchInput {
  const clientId = searchParams.get("clientId");
  if (clientId && clientId.trim() !== "") {
    return { mode: "clientId", clientId: clientId.trim() };
  }

  const lastName = searchParams.get("lastName");
  const DOB = searchParams.get("DOB");

  if (!lastName || lastName.trim() === "") {
    throw new ValidationError("lastName is required when clientId is not provided.");
  }

  if (!DOB || DOB.trim() === "") {
    throw new ValidationError("DOB is required when clientId is not provided.");
  }

  if (!isValidDateString(DOB)) {
    throw new ValidationError("DOB must be a valid date in YYYY-MM-DD format.");
  }

  return {
    mode: "lastNameDOB",
    lastName: lastName.trim(),
    DOB: DOB.trim(),
  };
}
