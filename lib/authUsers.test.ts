import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  hash: vi.fn(),
  compare: vi.fn(),
  createUser: vi.fn(),
  getUserByEmail: vi.fn(),
  isUsersTableEmpty: vi.fn(),
  listUsers: vi.fn(),
  deleteUserById: vi.fn(),
  toSafeUserRecord: vi.fn((user: { userId: string; email: string; role: string; createdAt: string }) => ({
    userId: user.userId,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  })),
  isConditionalCheckFailed: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: mocks.hash,
    compare: mocks.compare,
  },
}));

vi.mock("@/lib/dynamodb", () => ({
  createUser: mocks.createUser,
  getUserByEmail: mocks.getUserByEmail,
  isUsersTableEmpty: mocks.isUsersTableEmpty,
  listUsers: mocks.listUsers,
  deleteUserById: mocks.deleteUserById,
  toSafeUserRecord: mocks.toSafeUserRecord,
  isConditionalCheckFailed: mocks.isConditionalCheckFailed,
}));

import {
  authenticateUser,
  createManagedUser,
  ensureInitialAdminUser,
  listManagedUsers,
} from "@/lib/authUsers";

describe("auth user helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hash.mockResolvedValue("hashed");
    mocks.compare.mockResolvedValue(true);
    mocks.isConditionalCheckFailed.mockReturnValue(false);
    delete process.env.INITIAL_ADMIN_EMAIL;
    delete process.env.INITIAL_ADMIN_PASSWORD;
  });

  it("seeds initial admin when users table is empty", async () => {
    process.env.INITIAL_ADMIN_EMAIL = "admin@careledger.org";
    process.env.INITIAL_ADMIN_PASSWORD = "password123";
    mocks.isUsersTableEmpty.mockResolvedValue(true);
    mocks.createUser.mockResolvedValue(undefined);

    await ensureInitialAdminUser();

    expect(mocks.createUser).toHaveBeenCalledTimes(1);
    expect(mocks.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "admin",
        email: "admin@careledger.org",
        role: "admin",
      }),
    );
  });

  it("authenticates valid credentials", async () => {
    process.env.INITIAL_ADMIN_EMAIL = "admin@careledger.org";
    process.env.INITIAL_ADMIN_PASSWORD = "password123";
    mocks.isUsersTableEmpty.mockResolvedValue(false);
    mocks.getUserByEmail.mockResolvedValue({
      userId: "u1",
      email: "staff@careledger.org",
      passwordHash: "storedhash",
      role: "staff",
      createdAt: "2026-03-12",
    });
    mocks.compare.mockResolvedValue(true);

    const result = await authenticateUser("staff@careledger.org", "password123");
    expect(result).toEqual({
      userId: "u1",
      email: "staff@careledger.org",
      role: "staff",
    });
  });

  it("returns null for bad password", async () => {
    process.env.INITIAL_ADMIN_EMAIL = "admin@careledger.org";
    process.env.INITIAL_ADMIN_PASSWORD = "password123";
    mocks.isUsersTableEmpty.mockResolvedValue(false);
    mocks.getUserByEmail.mockResolvedValue({
      userId: "u1",
      email: "staff@careledger.org",
      passwordHash: "storedhash",
      role: "staff",
      createdAt: "2026-03-12",
    });
    mocks.compare.mockResolvedValue(false);

    await expect(authenticateUser("staff@careledger.org", "wrong")).resolves.toBeNull();
  });

  it("creates managed users and rejects duplicates", async () => {
    process.env.INITIAL_ADMIN_EMAIL = "admin@careledger.org";
    process.env.INITIAL_ADMIN_PASSWORD = "password123";
    mocks.isUsersTableEmpty.mockResolvedValue(false);
    mocks.getUserByEmail.mockResolvedValueOnce(null).mockResolvedValueOnce({
      userId: "dup",
      email: "staff@careledger.org",
      passwordHash: "hash",
      role: "staff",
      createdAt: "2026-03-12",
    });
    mocks.createUser.mockResolvedValue(undefined);

    const created = await createManagedUser({
      email: "staff@careledger.org",
      password: "password123",
      role: "staff",
    });

    expect(created.email).toBe("staff@careledger.org");
    await expect(
      createManagedUser({
        email: "staff@careledger.org",
        password: "password123",
        role: "staff",
      }),
    ).rejects.toThrow();
  });

  it("lists managed users without password hashes", async () => {
    process.env.INITIAL_ADMIN_EMAIL = "admin@careledger.org";
    process.env.INITIAL_ADMIN_PASSWORD = "password123";
    mocks.isUsersTableEmpty.mockResolvedValue(false);
    mocks.listUsers.mockResolvedValue([
      {
        userId: "u1",
        email: "staff@careledger.org",
        passwordHash: "hash",
        role: "staff",
        createdAt: "2026-03-12",
      },
    ]);

    const users = await listManagedUsers();
    expect(users).toEqual([
      {
        userId: "u1",
        email: "staff@careledger.org",
        role: "staff",
        createdAt: "2026-03-12",
      },
    ]);
  });
});
