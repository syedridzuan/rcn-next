// app/admin/api/subscriptions/[subscriptionId]/cancel/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; // Your NextAuth or custom auth
import { prisma } from "@/lib/db"; // Your Prisma client
import { stripe } from "@/lib/stripe"; // Ensure you are importing the Node library

interface RouteContext {
  params: Promise<{ subscriptionId: string }>;
}

export async function POST(
  request: NextRequest,
  { params: promised }: RouteContext
) {
  try {
    // 1) Await the async params
    const { subscriptionId } = await promised;

    // 2) Check user roles, e.g. only ADMIN can schedule cancellation
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/?error=NoAccess", request.url));
    }

    // 3) Look up the local subscription record
    const subRecord = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!subRecord?.stripeSubscriptionId) {
      return NextResponse.redirect(
        new URL(
          `/admin/subscriptions/${subscriptionId}/cancel/failure`,
          request.url
        )
      );
    }

    // 4) Instead of immediate `.cancel(...)`,
    //    we do `.update(..., { cancel_at_period_end: true })`.
    await stripe.subscriptions.update(subRecord.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // 5) Update your local DB to reflect a “PENDING CANCEL” status,
    //    or whatever logic you prefer
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        // You might keep it "ACTIVE" but store some metadata, or set a new status:
        // status: "ACTIVE",
        // cancelAtPeriodEnd: true,
        // canceledAt: null,
        cancelAtPeriodEnd: true,
        canceledAt: null,
      },
    });

    // 6) Redirect to success page (or return a JSON success message)
    return NextResponse.redirect(
      new URL(
        `/admin/subscriptions/${subscriptionId}/cancel/success`,
        request.url
      )
    );
  } catch (error) {
    console.error("Error scheduling subscription cancellation:", error);

    // On error => redirect to failure page
    const { subscriptionId } = await promised;
    return NextResponse.redirect(
      new URL(
        `/admin/subscriptions/${subscriptionId}/cancel/failure`,
        request.url
      )
    );
  }
}
