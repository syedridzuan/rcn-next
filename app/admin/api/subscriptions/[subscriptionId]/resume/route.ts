import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe"; // If you have Stripe import

interface RouteContext {
  params: Promise<{
    subscriptionId: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params: promised }: RouteContext
) {
  try {
    // 1) Check admin
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/?error=NoAccess", request.url));
    }

    // 2) Get subscriptionId
    const { subscriptionId } = await promised;
    if (!subscriptionId) {
      return NextResponse.redirect(
        new URL("/admin/subscriptions?error=MissingSubscriptionID", request.url)
      );
    }

    // 3) Check existing
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!subscription) {
      return NextResponse.redirect(
        new URL("/admin/subscriptions?error=NotFound", request.url)
      );
    }

    // 4) Resume in Stripe (optional).
    //    e.g. if subscription.stripeSubscriptionId is set, do:
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    // 5) Resume locally
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd: false,
        status: "ACTIVE",
      },
    });

    // 6) On success => redirect to success
    return NextResponse.redirect(
      new URL(
        `/admin/subscriptions/${subscriptionId}/resume/success`,
        request.url
      )
    );
  } catch (error) {
    console.error("Error resuming subscription:", error);
    // 7) On error => redirect to failure
    const { subscriptionId } = await promised;
    return NextResponse.redirect(
      new URL(
        `/admin/subscriptions/${subscriptionId}/resume/failure`,
        request.url
      )
    );
  }
}
