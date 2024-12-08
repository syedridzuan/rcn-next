import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
