import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      userId: string;
      role: "admin" | "staff";
      email: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: "admin" | "staff";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: "admin" | "staff";
  }
}
