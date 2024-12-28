"use client";

import { Button } from "@/components/ui/button";

export default function BatalLanggananPage() {
  return (
    <main className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <div className="bg-white p-6 rounded shadow max-w-md w-full">
        <h1 className="text-xl font-bold mb-4">Langganan Dibatalkan</h1>
        <p className="mb-6">
          Langganan anda tidak diteruskan. Jika anda ingin mencuba lagi, sila
          klik butang di bawah untuk kembali ke halaman langganan.
        </p>
        <Button
          onClick={() => {
            window.location.href = "/langganan";
          }}
        >
          Kembali ke Halaman Langganan
        </Button>
      </div>
    </main>
  );
}
