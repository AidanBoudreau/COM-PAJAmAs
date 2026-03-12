import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import {
  createUser,
  deleteUserById,
  getUserByEmail,
  isConditionalCheckFailed,
  isUsersTableEmpty,
  listUsers,
  toSafeUserRecord,
  type SafeUserRecord,
  type UserRecord,
  type UserRole,
} from "@/lib/dynamodb";
import { ValidationError } from "@/lib/validation";

const BCRYPT_ROUNDS = 10;
const INITIAL_ADMIN_USER_ID = "admin";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
}

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required.`);
  }

  return value;
}

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function createUserWithRetries(
  userInput: Omit<UserRecord, "userId">,
  retries = 3,
) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const candidateId = randomUUID();
    try {
      const user: UserRecord = { ...userInput, userId: candidateId };
      await createUser(user);
      return user;
    } catch (error) {
      if (!isConditionalCheckFailed(error)) {
        throw error;
      }
    }
  }

  throw new Error("Unable to create user after multiple userId attempts.");
}

export async function ensureInitialAdminUser() {
  const isEmpty = await isUsersTableEmpty();
  if (!isEmpty) {
    return;
  }

  const email = normalizeEmail(getRequiredEnv("INITIAL_ADMIN_EMAIL"));
  const password = getRequiredEnv("INITIAL_ADMIN_PASSWORD");
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    await createUser({
      userId: INITIAL_ADMIN_USER_ID,
      email,
      passwordHash,
      role: "admin",
      createdAt: getTodayIsoDate(),
    });
  } catch (error) {
    if (!isConditionalCheckFailed(error)) {
      throw error;
    }
  }
}

export async function authenticateUser(email: string, password: string): Promise<AuthenticatedUser | null> {
  await ensureInitialAdminUser();

  const normalizedEmail = normalizeEmail(email);
  const user = await getUserByEmail(normalizedEmail);
  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return null;
  }

  return {
    userId: user.userId,
    email: user.email,
    role: user.role,
  };
}

interface CreateManagedUserInput {
  email: string;
  password: string;
  role: UserRole;
}

export async function createManagedUser(input: CreateManagedUserInput): Promise<SafeUserRecord> {
  await ensureInitialAdminUser();

  const email = normalizeEmail(input.email);
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new ValidationError("A user with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const created = await createUserWithRetries({
    email,
    passwordHash,
    role: input.role,
    createdAt: getTodayIsoDate(),
  });

  return toSafeUserRecord(created);
}

export async function listManagedUsers(): Promise<SafeUserRecord[]> {
  await ensureInitialAdminUser();

  const users = await listUsers();
  return users
    .map((user) => toSafeUserRecord(user))
    .sort((a, b) => a.email.localeCompare(b.email));
}

export async function deleteManagedUser(userId: string) {
  await ensureInitialAdminUser();
  return deleteUserById(userId);
}
