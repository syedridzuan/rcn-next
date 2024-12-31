import { Metadata } from "next";
import { SubscriptionDashboard } from "@/components/SubscriptionDashboard";

export const metadata: Metadata = {
  title: "Langganan Anda | MyApp",
  description: "Urus langganan dan maklumat pengebilan anda di MyApp",
};

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Langganan Anda
        </h1>
        <p className="text-gray-600">
          Urus langganan dan maklumat pengebilan anda di sini.
        </p>
      </header>
      <main>
        <SubscriptionDashboard />
      </main>
    </div>
  );
}
