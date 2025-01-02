// app/(standalone)/newsletter/layout.tsx
import type { Metadata } from "next";
import "@/app/globals.css"; // Ensure you import your Tailwind globals if needed

// If you’d like to add shadcn/ui providers (ThemeProvider, etc.),
// do so here. This minimal example just uses Tailwind utility classes.

export const metadata: Metadata = {
  title: "Newsletter",
  description: "Langganan e-mel untuk resepi terbaru.",
};

export default function NewsletterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {/* 
          Basic container for the newsletter pages
          Adjust styling as desired:
        */}
        <div className="flex flex-col items-center justify-center p-8">
          <header className="mb-8 w-full max-w-xl mx-auto text-center">
            <h1 className="text-2xl font-bold">Newsletter</h1>
            <p className="text-sm text-gray-600">
              Dapatkan kemaskini resepi terbaru terus ke inbox anda
            </p>
          </header>

          <main className="w-full max-w-xl bg-white p-6 rounded-md shadow-sm">
            {children}
          </main>

          {/* 
            Optional footer or disclaimers 
          */}
          <footer className="mt-8 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Resepi Che Nom. Hak Cipta
            Terpelihara.
          </footer>
        </div>
      </body>
    </html>
  );
}
