import { Metadata } from "next";
import { SubscriptionDashboard } from "@/components/SubscriptionDashboard";

/**
 * Optional: SEO metadata for this page
 */
export const metadata: Metadata = {
  title: "Subscription Management",
  description: "Manage your subscription plan and billing details",
};

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Subscription</h1>
      <SubscriptionDashboard />
    </div>
  );
}
