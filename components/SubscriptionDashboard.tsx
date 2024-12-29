"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Alert Dialog components from shadcn/ui
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface SubscriptionData {
  plan: string; // e.g., "BASIC"
  status: string; // e.g., "ACTIVE", "CANCELLED", etc.
  startDate: string; // ISO date string
  currentPeriodEnd?: string; // ISO date string (nullable)
  metadata?: {
    isPendingCancel?: string; // "true" if the user scheduled a cancel at period end
  };
}

export function SubscriptionDashboard() {
  const router = useRouter();
  const { toast } = useToast();

  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AlertDialog states:
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [uncancelDialogOpen, setUncancelDialogOpen] = useState(false);

  // 1. Fetch subscription on mount
  useEffect(() => {
    fetch("/api/subscriptions")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load subscription data.");
        return res.json();
      })
      .then((data) => {
        setSubscription(data.subscription || null);
      })
      .catch((err) => {
        console.error(err);
        setError("Ralat semasa memuatkan data langganan.");
      })
      .finally(() => setLoading(false));
  }, []);

  // 2. Cancel subscription handler
  const handleCancelSubscription = async () => {
    setCancelDialogOpen(false);

    try {
      const resp = await fetch("/api/subscriptions/cancel", {
        method: "POST",
      });
      if (!resp.ok) {
        throw new Error("Gagal membatalkan langganan.");
      }

      // Update local state to reflect the pending cancellation
      setSubscription((prev) =>
        prev
          ? {
              ...prev,
              metadata: {
                ...prev.metadata,
                isPendingCancel: "true",
              },
            }
          : prev
      );

      toast({
        title: "Dijadualkan Batal",
        description:
          "Langganan anda akan dibatalkan selepas tempoh langganan semasa tamat.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Ralat",
        description: "Tidak dapat membatalkan langganan.",
      });
    }
  };

  // 3. Un-cancel (reverse cancellation) handler
  const handleUncancelSubscription = async () => {
    setUncancelDialogOpen(false);

    try {
      const resp = await fetch("/api/subscriptions/uncancel", {
        method: "POST",
      });
      if (!resp.ok) {
        throw new Error("Gagal membatalkan jadual pembatalan.");
      }

      setSubscription((prev) =>
        prev
          ? {
              ...prev,
              metadata: {
                ...prev.metadata,
                isPendingCancel: "false",
              },
            }
          : prev
      );

      toast({
        title: "Batal Pembatalan",
        description: "Langganan anda tidak lagi dibatalkan.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Ralat",
        description: "Tidak dapat membatalkan jadual pembatalan.",
      });
    }
  };

  // RENDERING
  if (loading) {
    return <p>Sedang memuatkan data langganan...</p>;
  }
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  // If user has no subscription
  if (!subscription) {
    return (
      <div className="bg-white p-4 rounded shadow space-y-4">
        <p className="text-gray-800">Anda belum mempunyai langganan.</p>
        <p className="text-sm text-gray-600">
          Sila klik butang di bawah untuk melanggan pelan BASIC.
        </p>
        <Button
          onClick={() => {
            router.push("/account/subscriptions/new");
          }}
        >
          Langgan Pelan
        </Button>
      </div>
    );
  }

  const { plan, status, startDate, currentPeriodEnd, metadata } = subscription;
  const isPendingCancel = metadata?.isPendingCancel === "true";

  // Format dates
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
    <div className="bg-white p-4 rounded shadow space-y-3">
      <p className="text-sm text-gray-600">
        <strong>Pelan:</strong> {plan}
      </p>
      <p className="text-sm text-gray-600">
        <strong>Status:</strong> {status}
      </p>
      <p className="text-sm text-gray-600">
        <strong>Tarikh Mula:</strong> {formattedStartDate}
      </p>

      {/* Conditionally rename date label if sub is pending cancel */}
      {formattedPeriodEnd && (
        <>
          {isPendingCancel ? (
            <p className="text-sm text-yellow-600 font-semibold">
              <strong>Langganan akan tamat pada:</strong> {formattedPeriodEnd}
              <br />
              Anda masih boleh menikmati faedah ahli sehingga tarikh tersebut.
              Jika berubah fikiran, klik “Batal Pembatalan” di bawah.
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              <strong>Tarikh Pembaharuan:</strong> {formattedPeriodEnd}
            </p>
          )}
        </>
      )}

      {/* Cancel Button: only if subscription is active & not yet pending cancel */}
      {status === "ACTIVE" && !isPendingCancel && (
        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Batalkan Langganan</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Adakah anda pasti?</AlertDialogTitle>
              <AlertDialogDescription>
                Anda akan kehilangan semua faedah ahli selepas kitaran ini
                tamat. Tindakan ini tidak boleh dibuat asal.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelSubscription}>
                Ya, Batalkan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Uncancel Button: if it’s pending cancel */}
      {isPendingCancel && (
        <AlertDialog
          open={uncancelDialogOpen}
          onOpenChange={setUncancelDialogOpen}
        >
          <AlertDialogTrigger asChild>
            <Button variant="outline">Batal Pembatalan</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Batalkan Pembatalan?</AlertDialogTitle>
              <AlertDialogDescription>
                Jika anda teruskan, langganan anda akan diteruskan seperti biasa
                dan faedah ahli tidak akan tamat.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleUncancelSubscription}>
                Ya, Teruskan Langganan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
