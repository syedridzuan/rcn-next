import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; // NextAuth v5 server-side function
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
// Import the new email function:
import { sendUncancelConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Tidak dibenarkan. Sila log masuk." },
        { status: 401 }
      );
    }

    // 2. Find the user’s subscription that is ACTIVE + pending cancel
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
        // Replace this with your actual condition. This example uses metadata JSON to track isPendingCancel:
        metadata: {
          path: ["isPendingCancel"], // JSON path approach
          equals: "true",
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Tiada langganan yang dijadualkan untuk dibatalkan." },
        { status: 404 }
      );
    }

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "Langganan tidak sah (tiada sub ID)." },
        { status: 400 }
      );
    }

    // 2b. Retrieve the user so we can email them
    const user = await prisma.user.findUnique({
      where: { id: subscription.userId },
    });

    if (!user?.email) {
      return NextResponse.json(
        { error: "Pengguna atau emel tidak ditemui." },
        { status: 404 }
      );
    }

    // 3. Call Stripe to uncancel the subscription
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    // 4. Update local metadata: remove or set isPendingCancel to "false"
    let currentMetadata = subscription.metadata || {};
    delete currentMetadata["isPendingCancel"];
    // or if you prefer: currentMetadata["isPendingCancel"] = "false";

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        metadata: currentMetadata,
      },
    });

    // 5. Send an "uncancel confirmation" email to the user
    try {
      await sendUncancelConfirmationEmail(user.email);
    } catch (err) {
      console.error("Failed to send uncancel email:", err);
      // Not failing the entire request — just logging an error
    }

    return NextResponse.json({
      message: "Langganan anda telah diaktifkan semula.",
    });
  } catch (error: any) {
    console.error("Error uncanceling subscription:", error);
    return NextResponse.json(
      { error: "Gagal untuk membatalkan jadual pembatalan." },
      { status: 500 }
    );
  }
}
