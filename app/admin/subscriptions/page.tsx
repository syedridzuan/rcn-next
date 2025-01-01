// app/admin/subscriptions/page.tsx
import { prisma } from "@/lib/db";
import { authAdminCheck } from "@/utils/admin-check";
// ^ Example utility that ensures only Admin can load page
import { Subscription } from "@prisma/client";
import { Suspense } from "react";
import { SubscriptionsTable } from "./subscriptions-table"; // <— We'll create a client component

export default async function AdminSubscriptionsPage() {
  // 1) Check admin perms (optional)
  await authAdminCheck();

  // 2) Fetch all subscriptions (or use pagination if you wish)
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { email: true },
      },
    },
  });

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Subscriptions Management</h1>

      {/* Use Suspense if the client component might have additional fetch */}
      <Suspense fallback={<p>Loading subscriptions...</p>}>
        {/* Pass the data to a client component for the Cancel button logic */}
        <SubscriptionsTable subscriptions={subscriptions} />
      </Suspense>
    </main>
  );
}
