import { prisma } from "@/lib/db";
import { authAdminCheck } from "@/utils/admin-check";
import { Suspense } from "react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { notFound } from "next/navigation";

// Let Next.js know we might read query params
interface PageProps {
  searchParams?: {
    email?: string;
    subId?: string;
  };
}

export default async function AdminSubscriptionsPage({
  searchParams,
}: PageProps) {
  // Ensure only admin can view
  await authAdminCheck();

  // 1) Extract filter strings from searchParams
  const emailFilter = searchParams?.email?.trim();
  const subIdFilter = searchParams?.subId?.trim();

  // 2) Build a `where` clause
  const whereClause: any = {};

  // If user typed an email, filter by user email (case-insensitive partial match)
  if (emailFilter) {
    // Prisma requires we nest user filtering under: { user: { email: {...} } }
    whereClause.user = {
      email: {
        contains: emailFilter,
        mode: "insensitive",
      },
    };
  }

  // If user typed a subscription ID (partial match is optional; or use equals)
  if (subIdFilter) {
    whereClause.id = {
      contains: subIdFilter,
    };
  }

  // 3) Fetch all subscriptions (with filters)
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true } },
    },
    where: whereClause,
  });

  return (
    <main className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Subscriptions Management</h1>
        {/* <Button asChild>
          <Link href="/admin/subscriptions/new">Add Subscription</Link>
        </Button> */}
      </div>

      {/* 4) A simple GET form for filters */}
      <form method="GET" className="flex gap-2 items-center mb-6">
        <input
          type="text"
          name="email"
          placeholder="Filter by Email"
          defaultValue={emailFilter}
          className="border px-2 py-1 text-sm rounded"
        />
        <input
          type="text"
          name="subId"
          placeholder="Filter by Subscription ID"
          defaultValue={subIdFilter}
          className="border px-2 py-1 text-sm rounded"
        />
        <Button type="submit">Search</Button>
        {/* Optionally, a "Clear" link that resets filters */}
        {(emailFilter || subIdFilter) && (
          <Button variant="outline" asChild>
            <Link href="/admin/subscriptions">Clear</Link>
          </Button>
        )}
      </form>

      <Suspense fallback={<p>Loading subscriptions...</p>}>
        <SubscriptionsTableServer subscriptions={subscriptions} />
      </Suspense>
    </main>
  );
}

/**
 * A small server component that returns the data
 * in a shadcn/ui Table for the listing.
 *
 * We show subscription ID, user email, plan, status, startDate, currentPeriodEnd
 * plus a "View" action link.
 */
function SubscriptionsTableServer({
  subscriptions,
}: {
  subscriptions: Array<{
    id: string;
    plan: string;
    status: string;
    startDate: Date;
    currentPeriodEnd: Date | null;
    user: { email: string };
    createdAt: Date;
    updatedAt: Date;
  }>;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subscription ID</TableHead>
          <TableHead>User Email</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>Current Period End</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscriptions.map((sub) => {
          const start = sub.startDate
            ? formatDate(new Date(sub.startDate))
            : "—";
          const periodEnd = sub.currentPeriodEnd
            ? formatDate(new Date(sub.currentPeriodEnd))
            : "—";

          return (
            <TableRow key={sub.id}>
              <TableCell>{sub.id}</TableCell>
              <TableCell>{sub.user?.email ?? "No email"}</TableCell>
              <TableCell>{sub.plan}</TableCell>
              <TableCell>{sub.status}</TableCell>
              <TableCell>{start}</TableCell>
              <TableCell>{periodEnd}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" asChild>
                  <Link href={`/admin/subscriptions/${sub.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
