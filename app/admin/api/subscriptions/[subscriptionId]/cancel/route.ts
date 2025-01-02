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

    // 2) Check user roles, e.g. only ADMIN can cancel
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

    // 4) Cancel in Stripe using `.cancel(...)`
    await stripe.subscriptions.cancel(subRecord.stripeSubscriptionId);

    // 5) Update your local DB
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "CANCELLED",
        canceledAt: new Date(),
      },
    });

    // 6) Redirect to success page
    return NextResponse.redirect(
      new URL(
        `/admin/subscriptions/${subscriptionId}/cancel/success`,
        request.url
      )
    );
  } catch (error) {
    console.error("Error canceling subscription:", error);

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
