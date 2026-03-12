import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
}));

vi.mock("next-auth", () => ({
  getServerSession: mocks.getServerSession,
}));

vi.mock("@/lib/authOptions", () => ({
  authOptions: {},
}));

import { AuthorizationError, requireAdmin, requireSession } from "@/lib/auth";

describe("auth route guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns session user when authenticated", async () => {
    mocks.getServerSession.mockResolvedValue({
      user: {
        userId: "staff-1",
        email: "staff@example.com",
        role: "staff",
      },
    });

    await expect(requireSession()).resolves.toEqual({
      userId: "staff-1",
      email: "staff@example.com",
      role: "staff",
    });
  });

  it("throws unauthorized when session is missing", async () => {
    mocks.getServerSession.mockResolvedValue(null);
    await expect(requireSession()).rejects.toBeInstanceOf(AuthorizationError);
  });

  it("throws forbidden for non-admin role", async () => {
    mocks.getServerSession.mockResolvedValue({
      user: {
        userId: "staff-1",
        email: "staff@example.com",
        role: "staff",
      },
    });

    await expect(requireAdmin()).rejects.toBeInstanceOf(AuthorizationError);
  });
});
