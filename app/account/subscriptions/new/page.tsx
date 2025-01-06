"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// A client helper that calls an API endpoint to check if the user is subscribed
import { hasActiveSubscriptionClient } from "@/lib/subscription-client";

export default function NewSubscriptionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // UI states
  const [loading, setLoading] = useState(true);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  // Extract user’s email from the session
  const userEmail = session?.user?.email ?? "";

  // 1) If user is not logged in, optionally redirect them
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
      return;
    }

    // 2) If user is logged in, check subscription
    if (status === "authenticated") {
      (async () => {
        const isActive = await hasActiveSubscriptionClient();
        setAlreadySubscribed(isActive);
        setLoading(false);
      })();
    }
  }, [status, router]);

  // 3) While checking subscription or session, show a placeholder
  if (loading || status === "loading") {
    return <p>Sedang memeriksa status langganan...</p>;
  }

  // 4) If user already has an active subscription, show message instead of new-sub flow
  if (alreadySubscribed) {
    return (
      <main style={{ padding: "3rem", maxWidth: "700px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Anda sudah mempunyai langganan aktif
        </h1>
        <p>
          Jika anda ingin menukar pelan, sila hubungi sokongan atau batalkan
          langganan semasa terlebih dahulu.
        </p>
      </main>
    );
  }

  // 5) The “Langgan Sekarang” handler
  const handleSubscribe = async () => {
    if (!userEmail) {
      setCheckoutError("Email anda tidak ditemui. Sila log masuk semula.");
      return;
    }

    setCheckoutError(null);
    try {
      // Call your server route to create a subscription
      const response = await fetch("/api/subscribe-existing-user", {
        method: "POST",
      });

      if (!response.ok) {
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
    }
  };

  // 6) Render the subscription form UI if not subscribed
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
        {/* Left: Pelan Info */}
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

        {/* Right: Butang Langgan */}
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
            Langgan Sekarang
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
