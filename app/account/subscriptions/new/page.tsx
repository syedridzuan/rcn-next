"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// If you’re using a toast system (e.g., ShadCN UI):
// import { useToast } from "@/components/ui/use-toast";

export default function NewSubscriptionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  // const { toast } = useToast(); // if you want to show a toast

  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Safely extract user’s email from the session
  const userEmail = session?.user?.email ?? "";

  // 1. If user is not logged in, you may optionally redirect them
  useEffect(() => {
    if (status === "unauthenticated") {
      // e.g. redirect to sign in
      router.replace("/auth/signin");
    }
  }, [status, router]);

  // 2. Handle "Langgan Sekarang"
  const handleSubscribe = async () => {
    // If for some reason we lack an email, show an error
    if (!userEmail) {
      setCheckoutError("Email anda tidak ditemui. Sila log masuk semula.");
      return;
    }

    setLoading(true);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/subscribe-existing-user", {
        method: "POST",
      });

      if (!response.ok) {
        // e.g. 401 if not logged in, 500 on server error, etc.
        const { error } = await response.json();
        throw new Error(error || "Ralat semasa memproses langganan.");
      }

      const { url } = await response.json();
      if (!url) {
        throw new Error("URL daripada Checkout Session tidak diterima.");
      }

      // Redirect user to Stripe Checkout
      window.location.href = url;
    } catch (err: any) {
      setCheckoutError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <p>Sedang memeriksa status log masuk...</p>;
  }

  return (
    <main style={{ padding: "3rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1
        style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2rem" }}
      >
        Langganan Asas (Ahli Berdaftar)
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
        }}
      >
        {/* Kiri: Maklumat Pelan */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "2rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 4 }}>
            Pelan Asas
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#6B7280" }}>
            Pilihan tepat untuk mula mencuba
          </p>
          <h3
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginTop: "1rem",
            }}
          >
            RM 11.99/bulan
          </h3>
          <ul style={{ marginTop: "1rem", lineHeight: 1.6 }}>
            <li>✔ Bebas iklan</li>
            <li>✔ Keutamaan respon untuk komen</li>
            <li>✔ Akses awal resepi terkini</li>
          </ul>
        </div>

        {/* Kanan: Butang Langganan */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "2rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 4 }}>
            Langgan Sekarang
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#6B7280" }}>
            Emel anda: <strong>{userEmail || "Tiada"}</strong>
          </p>

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
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
