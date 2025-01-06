import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Sidebar from "./components/Sidebar"
import { Shell } from "@/components/shell"
import { Inter } from "next/font/google"
import Providers from "@/app/providers";
import type { Metadata } from "next"
import "@/app/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your account settings and preferences",
}

interface AccountLayoutProps {
  children: React.ReactNode
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  return (
    <html lang="en" className="light">
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
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
  )
}
