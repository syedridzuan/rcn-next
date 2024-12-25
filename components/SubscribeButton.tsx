"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

// Muatkan publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function SubscribeButton() {
  const [plan, setPlan] = useState<"BASIC" | "STANDARD" | "PREMIUM">("BASIC");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email) {
      alert("Sila masukkan emel anda.");
      return;
    }
    setLoading(true);

    try {
      // Panggil endpoint untuk cipta sesi langganan
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan, // Contohnya "BASIC", "STANDARD", atau "PREMIUM"
          customerEmail: email,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal mencipta sesi langganan");
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      if (stripe) {
        // Arahkan pengguna ke Stripe Checkout
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error("Ralat langganan:", error);
      alert("Berlaku ralat semasa mencipta langganan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <h2>Pilih Pelan Anda</h2>

      {/* Emel */}
      <div>
        <label htmlFor="email">Emel:</label>
        <input
          id="email"
          type="email"
          value={email}
          placeholder="Masukkan emel anda"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Radio button untuk memilih pelan */}
      <div style={{ marginTop: "1rem" }}>
        <label>
          <input
            type="radio"
            name="plan"
            value="BASIC"
            checked={plan === "BASIC"}
            onChange={() => setPlan("BASIC")}
          />
          BASIC
        </label>

        <label style={{ marginLeft: "1rem" }}>
          <input
            type="radio"
            name="plan"
            value="STANDARD"
            checked={plan === "STANDARD"}
            onChange={() => setPlan("STANDARD")}
          />
          STANDARD
        </label>

        <label style={{ marginLeft: "1rem" }}>
          <input
            type="radio"
            name="plan"
            value="PREMIUM"
            checked={plan === "PREMIUM"}
            onChange={() => setPlan("PREMIUM")}
          />
          PREMIUM
        </label>
      </div>

      {/* Butang Langgan */}
      <button
        onClick={handleSubscribe}
        disabled={loading}
        style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
      >
        {loading ? "Sedang diproses..." : "Langgan"}
      </button>
    </div>
  );
}
