// app/admin/subscriptions/CancelSubButton.tsx
"use client";

import { useTransition } from "react";

interface CancelSubButtonProps {
  subId: string;
  onSuccess?: (subId: string) => void;
  // optional callback for parent state update
}

export function CancelSubButton({ subId, onSuccess }: CancelSubButtonProps) {
  const [isPending, startTransition] = useTransition();

  async function handleCancel() {
    try {
      // POST to an admin route
      const res = await fetch(`/admin/api/subscriptions/${subId}/cancel`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to cancel subscription");
      }

      // Option A: Immediately call parent to remove or update the row
      onSuccess?.(subId);

      // Option B: Or do a `location.reload()` or custom refresh
      // location.reload();
    } catch (err) {
      console.error(err);
      alert("Error canceling subscription.");
    }
  }

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => handleCancel())}
      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
    >
      {isPending ? "Canceling..." : "Cancel"}
    </button>
  );
}
