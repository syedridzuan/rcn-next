import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

interface PageProps {
  params: Promise<{ subscriptionId: string }>;
}

export default async function CancelSuccessPage({
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

  // Optionally fetch the sub to confirm it's canceled
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    select: { id: true, status: true },
  });

  if (!subscription) {
    redirect("/admin/subscriptions?error=NotFound");
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Subscription Canceled</h1>
      <p className="mb-4">
        The subscription <strong>{subscriptionId}</strong> has been canceled
        successfully.
      </p>
      <a
        href={`/admin/subscriptions/${subscriptionId}`}
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        View Subscription Details
      </a>
    </main>
  );
}
