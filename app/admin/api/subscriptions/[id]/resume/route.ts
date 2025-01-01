// app/admin/api/subscriptions/[subscriptionId]/resume/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
// import { stripe } from "@/lib/stripe"; // if you want to call Stripe's API

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params: promised }: RouteContext
) {
  try {
    // 1) Check if the current user is an admin
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Await the id param
    const { id } = await promised;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // 3) Fetch the subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: id },
    });
    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // 4) Update DB to "resume" the subscription locally (set cancelAtPeriodEnd = false)
    //    You might also want to reset 'status' to 'ACTIVE' if you store that logic
    const updated = await prisma.subscription.update({
      where: { id: id },
      data: {
        cancelAtPeriodEnd: false,
        status: "ACTIVE",
      },
    });

    // 5) (Optional) Call Stripe to resume the subscription
    //    e.g. await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    //      cancel_at_period_end: false,
    //    });

    return NextResponse.json({
      success: true,
      subscription: updated,
    });
  } catch (error) {
    console.error("Error resuming subscription:", error);
    return NextResponse.json(
      { error: "Failed to resume subscription" },
      { status: 500 }
    );
  }
}
