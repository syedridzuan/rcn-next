import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster"; // shadcn's toaster
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Authentication",
  description: "Masuk, daftar, atau pulihkan akaun anda",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <div className="flex min-h-screen flex-col items-center justify-center p-6">
          {/* 
            Outer wrapper to center the content 
            (adjust background or spacing as needed) 
          */}
          <div className="w-full max-w-md bg-white p-8 rounded-md shadow-md">
            {/* 
              Inner container for form or content 
              (e.g. login, reset password, verify email, etc.)
            */}
            {children}
            <Toaster />
          </div>
        </div>
      </body>
    </html>
  );
}
