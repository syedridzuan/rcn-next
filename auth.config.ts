// auth.config.ts
import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isDashboard = nextUrl.pathname.startsWith('/dashboard')
      
      if (isDashboard) {
        if (isLoggedIn) return true
        return false
      }
      
      return true
    },
  },
  providers: [], // configured in auth.ts
} satisfies NextAuthConfig

// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const handler = NextAuth(authConfig);
export { handler as GET, handler as POST };

// middleware.ts
export const config = {
  matcher: [],
};
