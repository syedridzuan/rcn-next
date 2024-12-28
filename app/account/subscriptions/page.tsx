import { Metadata } from "next";
import { SubscriptionDashboard } from "@/components/SubscriptionDashboard";

export const metadata: Metadata = {
  title: "Langganan Saya",
  description: "Urus langganan dan maklumat pengebilan",
};

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Langganan Saya</h1>
      <SubscriptionDashboard />
    </div>
  );
}
