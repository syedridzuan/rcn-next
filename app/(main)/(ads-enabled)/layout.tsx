import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";

import Script from "next/script";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { GAProvider } from "@/components/providers/ga-provider";
import { Toaster } from "@/components/ui/toaster"; // shadcn Toaster

import { prisma } from "@/lib/db";
import { auth } from "@/auth"; // NextAuth v5 server function
import { hasActiveSubscription } from "@/lib/subscription";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Resepi Che Nom",
  description: "Hanya Resepi Masakan Terbaik",
};

export default async function AdsEnabledLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const isProduction = process.env.NODE_ENV === "production";

  // 1. Check if user is authenticated (server-side)
  const session = await auth();
  let isUserSubscribed = false;

  // 2. If logged in, verify subscription
  if (session?.user?.id) {
    isUserSubscribed = await hasActiveSubscription(session.user.id);
  }

  return (
    <>
      {/* Optional: Google Analytics */}
      {measurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${measurementId}', { send_page_view: false });
            `}
          </Script>
        </>
      )}

      {/* Only show AdSense script if in production AND user is NOT subscribed */}
      {isProduction && !isUserSubscribed && (
        <Script
          id="adsense-script"
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2342126410838343"
          crossOrigin="anonymous"
        />
      )}
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          {/* If you want GA events, conditionally render GAProvider */}
          {measurementId && <GAProvider />}

          {/* Render all child routes/components here */}
          {children}

          {/* Shadcn Toaster for toast notifications */}
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}
