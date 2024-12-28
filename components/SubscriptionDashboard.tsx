"use client";

import { useState, useEffect } from "react";

// Example subscription interface
interface SubscriptionData {
  plan: string; // e.g., "BASIC"
  status: string; // e.g., "ACTIVE", "CANCELLED", etc.
  startDate: string; // ISO date string
  currentPeriodEnd?: string; // ISO date string (nullable)
}

export function SubscriptionDashboard() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch subscription from your backend
    // Adjust the endpoint to your actual API (e.g., "/api/subscriptions" or similar)
    fetch("/api/subscriptions")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load subscription data");
        return res.json();
      })
      .then((data) => {
        // data.subscription might be null if no subscription found
        setSubscription(data.subscription || null);
      })
      .catch((err) => {
        console.error(err);
        setError("Ralat semasa memuatkan data langganan.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCancelSubscription = async () => {
    // 2. Call API to cancel subscription
    try {
      const resp = await fetch("/api/subscriptions/cancel", {
        method: "POST",
      });
      if (!resp.ok) {
        throw new Error("Gagal membatalkan langganan.");
      }

      // Optionally, refresh data or update state
      setSubscription((prev) =>
        prev
          ? {
              ...prev,
              status: "CANCELLED",
            }
          : prev
      );
      alert("Langganan anda telah dibatalkan.");
    } catch (error) {
      console.error(error);
      alert("Ralat semasa membatalkan langganan.");
    }
  };

  // 3. Loading state
  if (loading) {
    return <p>Sedang memuatkan data langganan...</p>;
  }

  // 4. Error state
  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  // 5. No subscription fallback
  if (!subscription) {
    return (
      <div className="bg-white p-4 rounded shadow">
        <p>Anda belum mempunyai langganan.</p>
        <p className="mt-2 text-sm text-gray-600">
          Sila pergi ke halaman <strong>Langganan</strong> untuk melanggan pelan
          BASIC.
        </p>
      </div>
    );
  }

  // 6. Display subscription details
  const { plan, status, startDate, currentPeriodEnd } = subscription;

  const formattedStartDate = new Date(startDate).toLocaleDateString("ms-MY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedPeriodEnd = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("ms-MY", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="bg-white p-4 rounded shadow space-y-2">
      <p className="text-sm text-gray-600">
        <strong>Pelan:</strong> {plan}
      </p>
      <p className="text-sm text-gray-600">
        <strong>Status:</strong> {status}
      </p>
      <p className="text-sm text-gray-600">
        <strong>Tarikh Mula:</strong> {formattedStartDate}
      </p>
      {formattedPeriodEnd && (
        <p className="text-sm text-gray-600">
          <strong>Tarikh Pembaharuan:</strong> {formattedPeriodEnd}
        </p>
      )}

      {status === "ACTIVE" && (
        <button
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
          onClick={handleCancelSubscription}
        >
          Batalkan Langganan
        </button>
      )}
    </div>
  );
}
