import { describe, expect, it } from "vitest";
import {
  ValidationError,
  isValidDateString,
  validateCreateClientInput,
  validateCreateUserInput,
  validateEligibilityConfigInput,
  validateHelpInput,
  validateSearchInput,
  validateUpdateClientInput,
} from "@/lib/validation";

describe("validation helpers", () => {
  it("validates create-client payload", () => {
    const payload = validateCreateClientInput({
      firstName: "John",
      lastName: "Smith",
      DOB: "1990-01-01",
      amount: 100,
      purpose: "Rent assistance",
      lastHelpedDate: "2025-01-01",
    });

    expect(payload).toEqual({
      firstName: "John",
      lastName: "Smith",
      DOB: "1990-01-01",
      amount: 100,
      purpose: "Rent assistance",
      lastHelpedDate: "2025-01-01",
    });
  });

  it("rejects invalid create-client payload", () => {
    expect(() =>
      validateCreateClientInput({
        firstName: "John",
        lastName: "Smith",
        DOB: "2025-13-01",
        amount: 10,
        purpose: "Food",
        lastHelpedDate: "2025-01-01",
      }),
    ).toThrow(ValidationError);
  });

  it("requires at least one update field", () => {
    expect(() => validateUpdateClientInput({})).toThrow(
      "At least one updatable field must be provided.",
    );
  });

  it("validates help payload", () => {
    const payload = validateHelpInput({
      lastHelpedDate: "2026-01-15",
      amount: 25,
      purpose: "Utilities",
    });

    expect(payload).toEqual({
      lastHelpedDate: "2026-01-15",
      amount: 25,
      purpose: "Utilities",
    });
  });

  it("validates eligibility config input", () => {
    expect(validateEligibilityConfigInput({ eligibilityWindowDays: 365 })).toEqual({
      eligibilityWindowDays: 365,
    });
    expect(() => validateEligibilityConfigInput({ eligibilityWindowDays: 0 })).toThrow(
      ValidationError,
    );
  });

  it("enforces search rules", () => {
    const byId = validateSearchInput(new URLSearchParams("clientId=abc-123"));
    expect(byId).toEqual({ mode: "clientId", clientId: "abc-123" });

    const byName = validateSearchInput(new URLSearchParams("lastName=Smith&DOB=1990-01-01"));
    expect(byName).toEqual({ mode: "lastNameDOB", lastName: "Smith", DOB: "1990-01-01" });

    expect(() => validateSearchInput(new URLSearchParams("lastName=Smith"))).toThrow(
      ValidationError,
    );
  });

  it("checks strict YYYY-MM-DD dates", () => {
    expect(isValidDateString("2024-02-29")).toBe(true);
    expect(isValidDateString("2025-02-29")).toBe(false);
    expect(isValidDateString("2026-1-1")).toBe(false);
  });

  it("validates create user input", () => {
    expect(
      validateCreateUserInput({
        email: "Admin@CareLedger.org",
        password: "password123",
        role: "admin",
      }),
    ).toEqual({
      email: "admin@careledger.org",
      password: "password123",
      role: "admin",
    });

    expect(() =>
      validateCreateUserInput({
        email: "invalid-email",
        password: "password123",
        role: "admin",
      }),
    ).toThrow(ValidationError);

    expect(() =>
      validateCreateUserInput({
        email: "admin@careledger.org",
        password: "short",
        role: "staff",
      }),
    ).toThrow(ValidationError);

    expect(() =>
      validateCreateUserInput({
        email: "admin@careledger.org",
        password: "password123",
        role: "guest",
      }),
    ).toThrow(ValidationError);
  });
});
