// File: app/error/suspended/page.tsx

import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Akaun Digantung",
  description: "Anda tidak boleh mengakses akaun anda buat sementara waktu",
};

export default function SuspendedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow p-6 rounded-md space-y-4">
        <h1 className="text-2xl font-bold">Akaun Anda Digantung</h1>
        <p className="text-gray-700">
          Maaf, akaun anda telah digantung buat sementara waktu. Sila hubungi
          pihak pentadbir atau wakil sokongan pelanggan untuk maklumat lanjut
          atau untuk mengaktifkan semula akaun anda.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Kembali ke Laman Utama
        </Link>
      </div>
    </main>
  );
}
