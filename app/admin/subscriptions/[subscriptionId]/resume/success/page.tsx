import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

interface PageProps {
  params: Promise<{ subscriptionId: string }>;
}

export default async function ResumeSuccessPage({
  params: promised,
}: PageProps) {
  // 1) Check Admin Access
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/?error=NoAccess");
  }

  // 2) Await the subscriptionId param (Next.js 15 style)
  const { subscriptionId } = await promised;
  if (!subscriptionId) {
    redirect("/admin/subscriptions?error=MissingSubscriptionID");
  }

  // 3) Optionally fetch the subscription to confirm it’s now active
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    select: { id: true, status: true },
  });

  if (!subscription) {
    redirect("/admin/subscriptions?error=NotFound");
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Subscription Resumed</h1>
      <p className="mb-4">
        The subscription <strong>{subscriptionId}</strong> has been successfully
        resumed.
      </p>

      {/* Link back to subscription detail page */}
      <a
        href={`/admin/subscriptions/${subscriptionId}`}
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        View Subscription Details
      </a>
    </main>
  );
}
