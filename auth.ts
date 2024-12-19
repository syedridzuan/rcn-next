import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcryptjs from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";

export const config = {
  adapter: PrismaAdapter(prisma),
  debug: true,
  providers: [
    Credentials({
      name: "Account",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("=== authorize function start ===");

        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("missing_credentials");
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            throw new Error("user_not_found");
          }

          if (!user.password) {
            throw new Error("no_password_set");
          }

          const isValid = await bcryptjs.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            throw new Error("invalid_password");
          }

          if (!user.emailVerified) {
            throw new Error("email_not_verified");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          if (error instanceof Error) {
            throw error;
          }
          throw new Error("unknown_error");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, error }) {
      console.log("=== signIn callback ===", { user, account, error });

      if (error) {
        console.log("SignIn error:", error);
        return `/auth/signin?error=${error}`;
      }

      if (account?.type === "credentials" && user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        
        if (!dbUser?.emailVerified) {
          return `/auth/signin?error=email_not_verified`;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      console.log("=== jwt callback ===");
      console.log("Token:", token);
      console.log("User:", user);
      
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);