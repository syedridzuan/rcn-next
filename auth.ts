// file: app/auth.ts (or /app/(api)/auth/[...nextauth]/route.ts in NextAuth v4.22+)
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcryptjs from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import { prisma } from "@/lib/db";

export const config: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  debug: true, // for development only; disable in production
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
          // 1) Basic checks
          if (!credentials?.email || !credentials?.password) {
            throw new Error("missing_credentials");
          }

          // 2) Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user) {
            throw new Error("user_not_found");
          }

          // 3) If user is suspended => return pseudo user
          if (user.status === "SUSPENDED") {
            return {
              id: "temp-suspended",
              suspended: true,
              email: user.email,
            };
          }

          // 4) Ensure user has a password set
          if (!user.password) {
            throw new Error("no_password_set");
          }

          // 5) Compare password
          const isValid = await bcryptjs.compare(
            credentials.password,
            user.password
          );
          if (!isValid) {
            throw new Error("invalid_password");
          }

          // 6) If user email not verified => return pseudo user
          if (!user.emailVerified) {
            return {
              id: "temp-unverified",
              email: user.email,
              isVerified: false,
            };
          }

          // 7) Otherwise, return real user
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isVerified: true,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw error;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user }) {
      console.log("=== signIn callback === user:", user);

      // If user is the pseudo-suspended user => redirect to sign-in with error
      if ((user as any).suspended) {
        return "/auth/signin?error=account_suspended";
      }

      // If user is pseudo-unverified => redirect with error
      if ((user as any).isVerified === false) {
        return "/auth/signin?error=email_not_verified";
      }

      // Otherwise, proceed
      return true;
    },

    async jwt({ token, user }) {
      // If we just authorized a real user
      if (
        user?.id &&
        user.id !== "temp-unverified" &&
        !(user as any).suspended
      ) {
        token.id = user.id;
        token.role = (user as any).role;
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
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
