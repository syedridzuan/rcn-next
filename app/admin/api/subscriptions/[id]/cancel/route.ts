// app/admin/api/subscriptions/[id]/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authAdminCheck } from "@/utils/admin-check";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await authAdminCheck(); // or any method to ensure admin perms

  try {
    const { id } = params;
    // Example: Mark subscription as CANCELLED in DB
    // or set cancelAtPeriodEnd = true if that’s your logic
    await prisma.subscription.update({
      where: { id },
      data: { status: "CANCELLED", canceledAt: new Date() },
    });

    // Possibly do Stripe API call if needed
    // await stripe.subscriptions.del(...);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
