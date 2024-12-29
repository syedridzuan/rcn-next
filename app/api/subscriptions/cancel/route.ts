// app/api/subscriptions/cancel/route.ts

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
// 1. Import your new email helper
import { sendCancelScheduledEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
    });

    if (!subscription?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription to cancel" },
        { status: 404 }
      );
    }

    // 1. Cancel at period end on Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // 2. Update local metadata to indicate pending cancel
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        metadata: {
          ...(subscription.metadata ?? {}),
          isPendingCancel: "true",
        },
      },
    });

    // 3. Send the “cancellation scheduled” email
    //    We need the user’s email for that:
    const user = await prisma.user.findUnique({
      where: { id: subscription.userId },
    });

    if (user?.email) {
      try {
        await sendCancelScheduledEmail(user.email);
      } catch (err) {
        console.error("Error sending cancellation scheduled email:", err);
        // Not failing the request, just logging the error.
      }
    }

    return NextResponse.json({
      message: "Subscription set to cancel at period end.",
    });
  } catch (error: any) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: "Failed to schedule subscription cancellation" },
      { status: 500 }
    );
  }
}
