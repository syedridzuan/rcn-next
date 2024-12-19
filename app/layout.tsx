import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Layout from '@/components/Layout'
import { AuthProvider } from "@/components/providers/auth-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from 'sonner'
import Script from 'next/script'
import { GAProvider } from '@/components/providers/ga-provider'  // ensure this file is "use client"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Your Recipe Site',
  description: 'Discover and share delicious recipes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="ms" suppressHydrationWarning>
      <head>
        {measurementId && (
          <>
            {/* GA4 Global Site Tag */}
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
      </head>
      <body className={`${inter.className} min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Layout>
              {/* If measurementId exists, add GAProvider to track route changes */}
              {measurementId && <GAProvider />}
              {children}
            </Layout>
            <Toaster richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}