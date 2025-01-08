import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db"; // <-- import Prisma here
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    const session = await auth();
    const path = request.nextUrl.pathname;

    // If user is trying to access admin, dashboard, or account routes
    if (
      path.startsWith("/admin") ||
      path.startsWith("/dashboard") ||
      path.startsWith("/account")
    ) {
      // 1) If no session => redirect to login
      if (!session) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("from", path);
        return NextResponse.redirect(loginUrl);
      }

      // 3) If accessing admin route => ensure user is an admin
      if (path.startsWith("/admin")) {
        if (session.user?.role !== "ADMIN") {
          return NextResponse.redirect(new URL("/", request.url));
        }
      }
    }

    // Otherwise, proceed
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: [
    // Paths to protect
    "/admin/:path*",
    "/dashboard/:path*",
    "/account/:path*",
    // Possibly your main site, but typically you exclude static, public, etc.
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
