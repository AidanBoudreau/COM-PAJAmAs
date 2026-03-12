import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticateUser } from "@/lib/authUsers";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) {
          return null;
        }

        const user = await authenticateUser(email, password);
        if (!user) {
          return null;
        }

        return {
          id: user.userId,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = typeof user.id === "string" ? user.id : "";
        token.email = typeof user.email === "string" ? user.email : "";
        token.role = (user as { role?: string }).role === "admin" ? "admin" : "staff";
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.userId = typeof token.userId === "string" ? token.userId : "";
        session.user.email = typeof token.email === "string" ? token.email : "";
        session.user.role = token.role === "admin" ? "admin" : "staff";
      }

      return session;
    },
  },
};
