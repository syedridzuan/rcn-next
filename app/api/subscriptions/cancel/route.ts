import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch user’s active subscription
    const existingSub = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { notIn: ["CANCELLED", "EXPIRED"] },
      },
    });

    if (!existingSub) {
      return NextResponse.json(
        { error: "No active subscription found to cancel" },
        { status: 404 }
      );
    }

    // 2. Update subscription status to CANCELLED (or handle Stripe logic first)
    const cancelledSub = await prisma.subscription.update({
      where: { id: existingSub.id },
      data: {
        status: "CANCELLED",
        // Possibly store cancellation date, reason, etc.
        canceledAt: new Date(),
      },
    });

    // If you're also using Stripe Subscriptions, make sure to cancel it via Stripe's API
    // e.g.:
    // await stripe.subscriptions.update(cancelledSub.stripeSubscriptionId, {
    //   cancel_at_period_end: true,
    // });

    return NextResponse.json({ subscription: cancelledSub });
  } catch (error) {
    // Make sure we log a simple string or safe object—no extra braces
    console.error("Error canceling subscription:", error);

    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
