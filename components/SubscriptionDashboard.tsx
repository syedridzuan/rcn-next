"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Extend the interface to capture any potential error messages
interface SubscriptionInfo {
  plan: string; // e.g., "BASIC" | "STANDARD" | "PREMIUM"
  status: string; // e.g., "ACTIVE" | "CANCELLED" | etc.
  currentPeriodEnd: string | null;
}

// Optionally define an error interface if you want to store errors in state
interface SubscriptionError {
  message: string;
}

export function SubscriptionDashboard() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<SubscriptionError | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchSubscription() {
      try {
        setLoading(true);
        setError(null); // clear any previous errors

        // Fetch the user’s subscription from your API route
        const res = await fetch("/api/subscriptions", { method: "GET" });
        if (!res.ok) {
          throw new Error(`Failed to fetch subscription info: ${res.status}`);
        }

        // Your server might return { subscription: {...} }
        // Adjust as needed based on how your API actually responds
        const data = await res.json();

        // Suppose your API responds with { subscription: SubscriptionInfo | null }
        if (!data || !data.subscription) {
          // No subscription found
          setSubscription(null);
        } else {
          setSubscription(data.subscription);
        }
      } catch (err: any) {
        console.error("Error fetching subscription:", err);
        setError({ message: err.message || "Unknown error occurred." });
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, []);

  if (loading) {
    return <p>Loading your subscription details...</p>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  // If no subscription was found, show a "no subscription" UI
  if (!subscription) {
    return (
      <div className="p-4 bg-white rounded shadow space-y-4">
        <p className="text-gray-600">
          You currently have no active subscription.
        </p>
        <button
          onClick={() => {
            // Perhaps redirect them to a "choose plan" page
            router.push("/pricing"); // or /plans, etc.
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Subscribe Now
        </button>
      </div>
    );
  }

  // Otherwise, we have a subscription object with plan & status
  const { plan, status, currentPeriodEnd } = subscription;

  // Example upgrade logic: if plan is BASIC or STANDARD, you might want to show a button to upgrade
  // Adjust as needed for your real plan logic
  const showUpgradeButton = plan === "BASIC" || plan === "STANDARD";
  const canCancel = status === "ACTIVE";

  async function handleUpgrade() {
    try {
      // Example: call an API route that changes the user’s plan
      // e.g. /api/subscriptions/change-plan?newPlan=PREMIUM
      const res = await fetch("/api/subscriptions/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPlan: "PREMIUM" }),
      });
      if (!res.ok) {
        throw new Error("Upgrade failed");
      }

      // Optionally refresh the subscription or show a success message
      alert("Upgrade successful. Enjoy your PREMIUM plan!");
      router.refresh();
    } catch (err: any) {
      alert(`Error upgrading: ${err.message}`);
    }
  }

  const handleCancelSubscription = async () => {
    try {
      const resp = await fetch("/api/subscriptions/cancel", { method: "POST" });
      if (!resp.ok) throw new Error("Failed to cancel subscription");

      alert("Subscription cancelled successfully.");
      // Manually update the subscription to reflect "no subscription"
      setSubscription(null);
      // Or setSubscription({...subscription, status: "CANCELLED"});
    } catch (error) {
      console.error(error);
      alert("An error occurred during cancellation.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded shadow space-y-2">
        <p className="text-sm text-gray-600">Plan: {plan}</p>
        <p className="text-sm text-gray-600">Status: {status}</p>
        {currentPeriodEnd && (
          <p className="text-sm text-gray-600">
            Next Billing Date: {currentPeriodEnd}
          </p>
        )}
      </div>

      {/* Show dynamic actions based on plan & status */}
      <div className="flex gap-4">
        {showUpgradeButton && (
          <button
            onClick={handleUpgrade}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Upgrade to PREMIUM
          </button>
        )}

        {canCancel && (
          <button
            onClick={handleCancelSubscription}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Cancel Subscription
          </button>
        )}
      </div>
    </div>
  );
}
