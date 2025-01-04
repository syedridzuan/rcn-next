"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export default function LanggananPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    // Handle redirect reason
    const reason = searchParams.get("reason");
    if (reason === "members-only") {
      toast({
        title: "Kandungan Eksklusif",
        description: "Sila langgan untuk mengakses kandungan ini.",
        variant: "default",
      });
    }

    // Handle authenticated users
    if (status === "authenticated") {
      toast({
        title: "Anda sudah log masuk",
        description: "Mengalihkan anda ke halaman langganan...",
      });

      const timer = setTimeout(() => {
        router.replace("/account/subscriptions/new");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [status, router, toast, searchParams]);

  const handleSubscribe = async () => {
    if (!email) {
      toast({
        title: "Perhatian",
        description: "Sila masukkan emel anda terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.status === 409) {
        setCheckoutError("Emel telah digunakan. Sila log masuk.");
        return;
      }

      if (!response.ok) {
        throw new Error("Ralat semasa memproses langganan.");
      }

      const { url, error } = await response.json();
      if (error) {
        throw new Error(error);
      }
      if (!url) {
        throw new Error("URL Checkout Session tidak diterima.");
      }

      window.location.href = url;
    } catch (error: any) {
      setCheckoutError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <p>Mengesahkan status log masuk...</p>;
  }

  return (
    <main style={{ padding: "3rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1
        style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2rem" }}
      >
        Langganan Asas
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
        }}
      >
        {/* Maklumat Pelan */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "2rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: 4,
            }}
          >
            Pelan Asas
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#6B7280" }}>
            Pilihan tepat untuk mula mencuba
          </p>
          <h3
            style={{ fontSize: "2rem", fontWeight: "bold", marginTop: "1rem" }}
          >
            RM 11.99/bulan
          </h3>
          <ul style={{ marginTop: "1rem", lineHeight: 1.6 }}>
            <li>✔ Bebas iklan</li>
            <li>✔ Resepi Premium</li>
            <li>✔ Keutamaan respon untuk komen</li>
            <li>✔ Akses awal resepi terkini</li>
          </ul>
        </div>

        {/* Borang Daftar */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "2rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: 4 }}
          >
            Daftar
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#6B7280" }}>
            Masukkan emel anda untuk melanggan
          </p>

          <div style={{ marginTop: "1rem" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: 6,
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              Emel
            </label>
            <input
              id="email"
              type="email"
              placeholder="contoh: [email protected]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "0.75rem",
                width: "100%",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
              }}
            />
          </div>

          <button
            onClick={handleSubscribe}
            disabled={loading}
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            {loading ? "Memproses..." : "Langgan Sekarang"}
          </button>

          {checkoutError && (
            <div style={{ marginTop: 10 }}>
              <p style={{ color: "red" }}>{checkoutError}</p>
              {checkoutError.includes("log masuk") && (
                <p style={{ marginTop: 8 }}>
                  <Link href="/auth/signin" style={{ color: "#0070f3" }}>
                    Log masuk
                  </Link>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
