import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import type { UserRole } from "@/lib/dynamodb";

export class AuthorizationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AuthorizationError";
    this.statusCode = statusCode;
  }
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
}

function parseRole(role: string | undefined): UserRole | null {
  if (role === "admin" || role === "staff") {
    return role;
  }

  return null;
}

export async function requireSession(): Promise<AuthenticatedUser> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId;
  const email = session?.user?.email;
  const role = parseRole(session?.user?.role);

  if (!userId || !email || !role) {
    throw new AuthorizationError("Unauthorized.", 401);
  }

  return { userId, email, role };
}

export async function requireAdmin() {
  const user = await requireSession();
  if (user.role !== "admin") {
    throw new AuthorizationError("Forbidden.", 403);
  }

  return user;
}
