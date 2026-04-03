import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/authUsers", () => ({
  authenticateUser: vi.fn(),
}));

import { authOptions } from "@/lib/authOptions";

describe("auth options callbacks", () => {
  it("stores user claims on jwt token", async () => {
    const callback = authOptions.callbacks?.jwt;
    const token = await callback?.({
      token: {},
      user: { id: "user-1", email: "staff@example.com", role: "staff" },
      trigger: "signIn",
      account: null,
      profile: undefined,
      isNewUser: false,
      session: undefined,
    });

    expect(token).toMatchObject({
      userId: "user-1",
      email: "staff@example.com",
      role: "staff",
    });
  });

  it("maps jwt claims to session user", async () => {
    const callback = authOptions.callbacks?.session;
    const session = await callback?.({
      session: { user: { name: "", email: "", image: null }, expires: "" },
      token: { userId: "admin-1", email: "admin@example.com", role: "admin" },
      user: undefined,
      trigger: undefined,
      newSession: undefined,
    });

    expect(session?.user).toMatchObject({
      userId: "admin-1",
      email: "admin@example.com",
      role: "admin",
    });
  });
});
