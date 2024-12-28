import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Langganan ASAS",
  description: "Daftar untuk pelan asas kami",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms">
      <body className={inter.className}>
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
          {children}
        </main>
      </body>
    </html>
  );
}
