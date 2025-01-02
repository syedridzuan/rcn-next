import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

interface PageProps {
  params: Promise<{ subscriptionId: string }>;
}

export default async function CancelFailurePage({
  params: promised,
}: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/?error=NoAccess");
  }

  const { subscriptionId } = await promised;
  if (!subscriptionId) {
    redirect("/admin/subscriptions?error=NoSubscriptionId");
  }

  // Optionally you could log or fetch the subscription to see its current status
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    select: { id: true, status: true },
  });

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cancellation Failed</h1>
      <p className="mb-4 text-red-600">
        We encountered an error while canceling subscription{" "}
        <strong>{subscriptionId}</strong>.
      </p>
      <p>
        Please check the logs or your Stripe dashboard to see if partial changes
        took place.
      </p>

      <a
        href={`/admin/subscriptions/${subscriptionId}`}
        className="inline-block px-4 py-2 mt-4 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        Return to Subscription
      </a>
    </main>
  );
}
