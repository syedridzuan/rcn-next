"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Subscription {
  id: string;
  plan: string; // BASIC, STANDARD, etc.
  status: string; // ACTIVE, CANCELLED, etc.
  startDate: string; // ISO string
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  stripeSubscriptionId: string | null;
  interval: string | null; // MONTHLY, YEARLY, etc.
  trialEnd: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export default function SubscriptionSuccessPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch("/api/subscriptions");
        if (!response.ok) {
          throw new Error("Gagal memuatkan maklumat langganan.");
        }
        const data = await response.json();
        setSubscription(data.subscription); // could be null
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading) {
    return (
      <main className="container mx-auto flex items-center justify-center min-h-screen p-4">
        <p>Sedang memuatkan maklumat langganan...</p>
      </main>
    );
  }

  if (!subscription) {
    return (
      <main className="container mx-auto flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Langganan Tidak Dijumpai
            </CardTitle>
            <CardDescription>
              Anda mungkin belum melanggan sebarang pelan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="default"
              onClick={() => {
                // Mungkin kembali ke halaman langganan
                router.push("/langganan");
              }}
            >
              Lihat Pelan Langganan
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Format date strings
  const startDateFormatted = new Date(
    subscription.startDate
  ).toLocaleDateString("ms-MY");
  const endDateFormatted = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("ms-MY")
    : null;

  return (
    <main className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Terima kasih kerana melanggan!
          </CardTitle>
          <CardDescription>
            Langganan anda telah berjaya diproses.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Berikut adalah butiran langganan anda:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>
              <strong>Pelan:</strong> {subscription.plan}
            </li>
            <li>
              <strong>Status:</strong> {subscription.status}
            </li>
            <li>
              <strong>Tarikh Mula:</strong> {startDateFormatted}
            </li>
            {endDateFormatted && (
              <li>
                <strong>Tarikh Tamat:</strong> {endDateFormatted}
              </li>
            )}
            {subscription.interval && (
              <li>
                <strong>Kekerapan:</strong> {subscription.interval}
              </li>
            )}
          </ul>
          <p className="text-sm text-gray-600">
            Terima kasih sekali lagi atas sokongan anda. Selamat menikmati
            faedah penuh langganan ini!
          </p>

          <Button
            variant="default"
            onClick={() => {
              // Sebagai contoh, kembali ke halaman langganan
              router.push("/account/subscriptions");
            }}
          >
            Kembali ke Halaman Langganan
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
