import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe"; // Your configured Stripe instance
import { prisma } from "@/lib/db"; // Your Prisma client
import { auth } from "@/auth"; // Your NextAuth v5 server-side function
import { sendReSubInitiatedEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    // 1. Ensure user is authenticated
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Anda belum log masuk." },
        { status: 401 }
      );
    }

    // 2. Retrieve the user from DB
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemui." },
        { status: 404 }
      );
    }

    // 3. Use your BASIC price ID from environment
    const BASIC_PRICE_ID = process.env.STRIPE_BASIC_PRICE_ID;
    if (!BASIC_PRICE_ID) {
      return NextResponse.json(
        { error: "BASIC price ID not set in environment." },
        { status: 500 }
      );
    }

    // 4. Create a new Checkout Session in Stripe
    // We store `metadata.userId` so your Stripe webhook can detect "existing user" path
    // ... and `customer_email` to auto-fill their email in Checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: BASIC_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
      },
      customer_email: user.email,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/langganan/berjaya`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/langganan/batal`,
    });

    // 5. (Optional) Email them that they've *started* a re-subscription process
    //    Payment confirmation is better handled in the Stripe webhook
    try {
      await sendReSubInitiatedEmail(user.email);
    } catch (err) {
      console.error("Failed to send re-sub email:", err);
      // Not critical enough to fail the entire request
    }

    // 6. Return the Checkout Session URL
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error(
      "Error creating (or renewing) subscription for existing user:",
      error
    );
    return NextResponse.json(
      { error: "Ralat semasa mencipta langganan." },
      { status: 500 }
    );
  }
}
