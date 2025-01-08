import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Sidebar from "./components/Sidebar";
import { Shell } from "@/components/shell";
import { Inter } from "next/font/google";
import Providers from "@/app/providers";
import type { Metadata } from "next";
import "@/app/globals.css";

export const runtime = "nodejs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your account settings and preferences",
};

interface AccountLayoutProps {
  children: React.ReactNode;
}

/**
 * This layout only applies to /account/* routes.
 * We do a DB check for user suspension here, and
 * if suspended => redirect("/error/force-suspend").
 *
 * The /error/force-suspend route forcibly clears NextAuth cookies
 * then sends the user to /error/suspended.
 */
export default async function AccountLayout({ children }: AccountLayoutProps) {
  // 1) Check user session
  const session = await auth();
  if (!session?.user?.email) {
    // If no user, go sign in
    redirect("/auth/signin");
  }

  // 2) Re-check DB to see if user is suspended
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { status: true },
  });

  // 3) If suspended => redirect to /error/force-suspend
  if (dbUser?.status === "SUSPENDED") {
    redirect("/error/force-suspend");
  }

  // 4) Otherwise, render the account layout
  return (
    <html lang="en" className="light">
      <body
        className={`${inter.className} min-h-screen bg-background antialiased`}
      >
        <div className="relative flex min-h-screen flex-col">
          <Shell>
            <div className="flex min-h-[calc(100vh-4rem)]">
              <Sidebar />
              <main className="flex-1 overflow-y-auto">
                <div className="container p-6">
                  <Providers>{children}</Providers>
                </div>
              </main>
            </div>
          </Shell>
        </div>
      </body>
    </html>
  );
}
