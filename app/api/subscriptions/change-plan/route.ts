import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

interface RequestBody {
  newPlan: string; // e.g. "BASIC", "STANDARD", "PREMIUM"
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { newPlan } = (await request.json()) as RequestBody;

    // Optional: Validate the new plan
    const validPlans = ["BASIC", "STANDARD", "PREMIUM"];
    if (!validPlans.includes(newPlan)) {
      return NextResponse.json(
        { error: "Invalid plan specified" },
        { status: 400 }
      );
    }

    // 1. Fetch user’s active subscription
    const existingSub = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { notIn: ["CANCELLED", "EXPIRED"] },
      },
    });

    if (!existingSub) {
      // User does not currently have a subscription
      return NextResponse.json(
        { error: "No active subscription to change" },
        { status: 404 }
      );
    }

    // 2. Update subscription’s plan
    const updatedSub = await prisma.subscription.update({
      where: { id: existingSub.id },
      data: {
        plan: newPlan,
        // Potentially store changes to priceId or stripeSubscriptionId if needed
      },
    });

    return NextResponse.json({ subscription: updatedSub });
  } catch (error) {
    console.error("Error changing subscription plan:", error);
    return NextResponse.json(
      { error: "Failed to change subscription plan" },
      { status: 500 }
    );
  }
}
