// file: auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcryptjs from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import { prisma } from "@/lib/db";

// --- NextAuth Config Object ---
export const config: NextAuthConfig = {
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

          // Instead of *throwing* if unverified, return a minimal pseudo-user
          if (!user.emailVerified) {
            return {
              // use a special ID or marker
              id: "temp-unverified",
              email: user.email,
              isVerified: false,
            };
          }

          // Otherwise, return the real user object
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isVerified: true,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          // Rethrow other errors so NextAuth sets result.error = "CallbackRouteError"
          throw error;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // Runs after "authorize()" but before finalizing sign-in
    async signIn({ user }) {
      console.log("=== signIn callback === user:", user);
      // If user is a "pseudo-user" => unverified
      if (user && user.isVerified === false) {
        // Return a string => NextAuth will redirect
        return "/auth/signin?error=email_not_verified";
      }
      // Otherwise, let them in
      return true;
    },

    async jwt({ token, user }) {
      //console.log("=== jwt callback === token:", token, " user:", user);

      // If real user returned from authorize() => copy to token
      if (user?.id && user.id !== "temp-unverified") {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      // Copy ID and role from token to session
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

// Export the NextAuth “app routes” interface
export const { handlers, auth, signIn, signOut } = NextAuth(config);
