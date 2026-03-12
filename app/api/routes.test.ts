import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  class MockAuthorizationError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
      super(message);
      this.name = "AuthorizationError";
      this.statusCode = statusCode;
    }
  }

  return {
    MockAuthorizationError,
    requireSession: vi.fn(),
    requireAdmin: vi.fn(),
    createClient: vi.fn(),
    isConditionalCheckFailed: vi.fn(),
    getClientById: vi.fn(),
    updateClientById: vi.fn(),
    searchClientsByLastNameAndDob: vi.fn(),
    listManagedUsers: vi.fn(),
    createManagedUser: vi.fn(),
    deleteManagedUser: vi.fn(),
  };
});

vi.mock("@/lib/auth", () => ({
  AuthorizationError: mocks.MockAuthorizationError,
  requireSession: mocks.requireSession,
  requireAdmin: mocks.requireAdmin,
}));

vi.mock("@/lib/dynamodb", () => ({
  createClient: mocks.createClient,
  isConditionalCheckFailed: mocks.isConditionalCheckFailed,
  getClientById: mocks.getClientById,
  updateClientById: mocks.updateClientById,
  searchClientsByLastNameAndDob: mocks.searchClientsByLastNameAndDob,
}));

vi.mock("@/lib/authUsers", () => ({
  listManagedUsers: mocks.listManagedUsers,
  createManagedUser: mocks.createManagedUser,
  deleteManagedUser: mocks.deleteManagedUser,
}));

import { POST as createClientRoute } from "@/app/api/clients/route";
import { GET as getClientRoute, PUT as updateClientRoute } from "@/app/api/clients/[clientId]/route";
import { GET as searchClientsRoute } from "@/app/api/clients/search/route";
import { GET as eligibilityRoute } from "@/app/api/clients/[clientId]/eligibility/route";
import { POST as helpRoute } from "@/app/api/clients/[clientId]/help/route";
import { GET as getEligibilityConfigRoute, PUT as updateEligibilityConfigRoute } from "@/app/api/config/eligibility/route";
import { GET as listUsersRoute, POST as createUserRoute } from "@/app/api/users/route";
import { DELETE as deleteUserRoute } from "@/app/api/users/[userId]/route";

describe("API route smoke tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireSession.mockResolvedValue({
      userId: "staff-1",
      role: "staff",
      email: "staff@example.com",
    });
    mocks.requireAdmin.mockResolvedValue({
      userId: "admin-1",
      role: "admin",
      email: "admin@example.com",
    });
    mocks.isConditionalCheckFailed.mockReturnValue(false);
  });

  it("creates a client", async () => {
    mocks.createClient.mockResolvedValue(undefined);

    const request = new Request("http://localhost/api/clients", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        firstName: "John",
        lastName: "Smith",
        DOB: "1990-01-01",
        amount: 50,
        purpose: "Food",
        lastHelpedDate: "2026-01-01",
      }),
    });

    const response = await createClientRoute(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.clientId).toBeTypeOf("string");
    expect(mocks.createClient).toHaveBeenCalledTimes(1);
  });

  it("returns 400 for invalid create payload", async () => {
    const request = new Request("http://localhost/api/clients", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        lastName: "Smith",
      }),
    });

    const response = await createClientRoute(request);
    expect(response.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    mocks.requireSession.mockRejectedValueOnce(new mocks.MockAuthorizationError("Unauthorized.", 401));

    const response = await createClientRoute(
      new Request("http://localhost/api/clients", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firstName: "Jane",
          lastName: "Doe",
          DOB: "1990-01-01",
          amount: 10,
          purpose: "Food",
          lastHelpedDate: "2026-01-01",
        }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("gets and updates a client", async () => {
    mocks.getClientById.mockResolvedValue({
      clientId: "abc",
      firstName: "John",
      lastName: "Smith",
      DOB: "1990-01-01",
      amount: 75,
      purpose: "Food",
      lastHelpedDate: "2025-01-01",
    });
    mocks.updateClientById.mockResolvedValue({
      clientId: "abc",
      firstName: "John",
      lastName: "Smith",
      DOB: "1990-01-01",
      amount: 100,
      purpose: "Utilities",
      lastHelpedDate: "2025-01-01",
    });

    const getResponse = await getClientRoute(
      new Request("http://localhost/api/clients/abc"),
      { params: Promise.resolve({ clientId: "abc" }) },
    );
    expect(getResponse.status).toBe(200);

    const updateResponse = await updateClientRoute(
      new Request("http://localhost/api/clients/abc", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: 100, purpose: "Utilities" }),
      }),
      { params: Promise.resolve({ clientId: "abc" }) },
    );

    const updateJson = await updateResponse.json();
    expect(updateResponse.status).toBe(200);
    expect(updateJson.data.amount).toBe(100);
  });

  it("returns 404 when client is missing", async () => {
    mocks.getClientById.mockResolvedValue(null);

    const response = await getClientRoute(
      new Request("http://localhost/api/clients/missing"),
      { params: Promise.resolve({ clientId: "missing" }) },
    );

    expect(response.status).toBe(404);
  });

  it("searches clients and validates query", async () => {
    mocks.searchClientsByLastNameAndDob.mockResolvedValue([
      {
        clientId: "abc",
        firstName: "John",
        lastName: "Smith",
        DOB: "1990-01-01",
        amount: 50,
        purpose: "Food",
        lastHelpedDate: "2025-01-01",
      },
    ]);

    const response = await searchClientsRoute(
      new Request("http://localhost/api/clients/search?lastName=Smith&DOB=1990-01-01"),
    );
    expect(response.status).toBe(200);

    const invalidResponse = await searchClientsRoute(
      new Request("http://localhost/api/clients/search?lastName=Smith"),
    );
    expect(invalidResponse.status).toBe(400);
  });

  it("returns eligibility data", async () => {
    mocks.getClientById.mockResolvedValue({
      clientId: "abc",
      firstName: "John",
      lastName: "Smith",
      DOB: "1990-01-01",
      amount: 50,
      purpose: "Food",
      lastHelpedDate: "2025-01-01",
    });
    const response = await eligibilityRoute(
      new Request("http://localhost/api/clients/abc/eligibility"),
      { params: Promise.resolve({ clientId: "abc" }) },
    );

    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.data).toHaveProperty("eligible");
    expect(json.data).toHaveProperty("daysSinceLastHelp");
    expect(json.data).toHaveProperty("daysRemaining");
    expect(json.data).toHaveProperty("nextEligibleDate");
  });

  it("records help and handles missing clients", async () => {
    mocks.updateClientById.mockResolvedValueOnce({
      clientId: "abc",
      firstName: "John",
      lastName: "Smith",
      DOB: "1990-01-01",
      amount: 75,
      purpose: "Utilities",
      lastHelpedDate: "2026-03-01",
    });
    mocks.updateClientById.mockResolvedValueOnce(null);

    const successResponse = await helpRoute(
      new Request("http://localhost/api/clients/abc/help", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          lastHelpedDate: "2026-03-01",
          amount: 75,
          purpose: "Utilities",
        }),
      }),
      { params: Promise.resolve({ clientId: "abc" }) },
    );
    expect(successResponse.status).toBe(200);

    const notFoundResponse = await helpRoute(
      new Request("http://localhost/api/clients/missing/help", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          lastHelpedDate: "2026-03-01",
        }),
      }),
      { params: Promise.resolve({ clientId: "missing" }) },
    );
    expect(notFoundResponse.status).toBe(404);
  });

  it("gets and updates eligibility config with validation", async () => {
    const getResponse = await getEligibilityConfigRoute(new Request("http://localhost/api/config/eligibility"));
    expect(getResponse.status).toBe(200);
    expect(mocks.requireAdmin).toHaveBeenCalledTimes(1);
    const getJson = await getResponse.json();
    expect(getJson.data.eligibilityWindowDays).toBe(365);

    const putResponse = await updateEligibilityConfigRoute(
      new Request("http://localhost/api/config/eligibility", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ eligibilityWindowDays: 180 }),
      }),
    );
    expect(putResponse.status).toBe(405);
  });

  it("supports admin user management routes", async () => {
    mocks.listManagedUsers.mockResolvedValue([
      { userId: "admin-1", email: "admin@example.com", role: "admin", createdAt: "2026-03-10" },
    ]);
    mocks.createManagedUser.mockResolvedValue({
      userId: "staff-1",
      email: "staff@example.com",
      role: "staff",
      createdAt: "2026-03-10",
    });
    mocks.deleteManagedUser.mockResolvedValue(true);

    const listResponse = await listUsersRoute();
    expect(listResponse.status).toBe(200);

    const createResponse = await createUserRoute(
      new Request("http://localhost/api/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "staff@example.com",
          password: "password123",
          role: "staff",
        }),
      }),
    );
    expect(createResponse.status).toBe(201);

    const deleteResponse = await deleteUserRoute(
      new Request("http://localhost/api/users/staff-1", { method: "DELETE" }),
      { params: Promise.resolve({ userId: "staff-1" }) },
    );
    expect(deleteResponse.status).toBe(200);
  });

  it("returns 403 for non-admin user routes", async () => {
    mocks.requireAdmin.mockRejectedValueOnce(new mocks.MockAuthorizationError("Forbidden.", 403));
    const response = await listUsersRoute();
    expect(response.status).toBe(403);
  });
});
