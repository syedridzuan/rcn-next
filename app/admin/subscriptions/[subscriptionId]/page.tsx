// File: app/admin/subscriptions/[subscriptionId]/page.tsx
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import SubscriptionActionsClient from "./SubscriptionActionsClient";

export const dynamic = "force-dynamic";

/**
 * Next.js 15: `params` is a Promise,
 * so define an interface to reflect that.
 */
interface PageProps {
  params: Promise<{
    subscriptionId: string;
  }>;
}

export default async function AdminSubscriptionDetailPage({
  params: promised,
}: PageProps) {
  // 1) Ensure the user is an admin
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/?error=NoAccess");
  }

  // 2) Await the params
  const { subscriptionId } = await promised;
  if (!subscriptionId) {
    notFound();
  }

  // 3) Fetch subscription from DB
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!subscription) {
    notFound();
  }

  // Format dates
  const startDate = subscription.startDate
    ? new Date(subscription.startDate).toLocaleString()
    : "—";
  const periodEnd = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleString()
    : "—";

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Subscription Details</h1>

      <div className="space-y-3">
        <p>
          <strong>User: </strong>
          {subscription.user?.name} ({subscription.user?.email})
        </p>
        <p>
          <strong>Plan: </strong>
          {subscription.plan}
        </p>
        <p>
          <strong>Status: </strong>
          {subscription.status}
        </p>
        <p>
          <strong>Stripe Subscription ID: </strong>
          {subscription.stripeSubscriptionId || "—"}
        </p>
        <p>
          <strong>Start Date: </strong>
          {startDate}
        </p>
        <p>
          <strong>Current Period End: </strong>
          {periodEnd}
        </p>
        <p>
          <strong>Cancel At Period End: </strong>
          {subscription.cancelAtPeriodEnd ? "Yes" : "No"}
        </p>
        {subscription.canceledAt && (
          <p>
            <strong>Canceled At:</strong>{" "}
            {new Date(subscription.canceledAt).toLocaleString()}
          </p>
        )}

        {/* 4) Render the client component with the necessary props */}
        <SubscriptionActionsClient subscription={subscription} />
      </div>
    </main>
  );
}
