// utils/admin-check.ts
import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * authAdminCheck
 *
 * 1. Retrieves the session from NextAuth (or your custom auth).
 * 2. Redirects if the user is not an Admin.
 *
 * Usage (in a server component or route handler):
 *    await authAdminCheck();
 */
export async function authAdminCheck() {
  const session = await auth();

  // If no user or user’s role is not ADMIN, redirect or throw an error
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/?error=NoAccess");
    // or optionally:
    // throw new Error("You do not have permission to access this page.");
  }
}
