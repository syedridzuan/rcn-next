import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcryptjs from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";

export const config = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Ensure credentials are provided
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        // Fetch user from the database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No user found with that email");
        }

        if (!user.password) {
          throw new Error("User does not have a password set");
        }

        // Validate password
        const isPasswordValid = await bcryptjs.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        // Safely handle role (if not defined, default to USER)
        const role = user.role ?? "USER";

        // Return user object for NextAuth
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // When user logs in or refreshes, attach their ID and role to the JWT
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Make sure session user includes ID and role
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);