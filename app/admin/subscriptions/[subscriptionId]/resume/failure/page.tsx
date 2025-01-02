import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

interface PageProps {
  params: Promise<{ subscriptionId: string }>;
}

export default async function ResumeFailurePage({
  params: promised,
}: PageProps) {
  // 1) Check Admin Access
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/?error=NoAccess");
  }

  // 2) Await the subscriptionId
  const { subscriptionId } = await promised;
  if (!subscriptionId) {
    redirect("/admin/subscriptions?error=MissingSubscriptionID");
  }

  // 3) Optional: fetch the subscription record
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    select: { id: true, status: true },
  });

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Resume Failed</h1>
      <p className="mb-4 text-red-500">
        We encountered an error resuming subscription{" "}
        <strong>{subscriptionId}</strong>.
      </p>
      <p>Please check logs or your Stripe dashboard for partial changes.</p>

      <a
        href={`/admin/subscriptions/${subscriptionId}`}
        className="inline-block px-4 py-2 mt-4 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        Return to Subscription
      </a>
    </main>
  );
}
