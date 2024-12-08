import { NextResponse } from "next/server";
import { auth } from "./auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/auth/signin", req.url));
  }

  return NextResponse.next();
});

// Update matcher to exclude auth routes and static files
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/dashboard/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|auth/signin).*)",
  ],
};
