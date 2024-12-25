// app/api/webhooks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

// If you want to ensure Node runtime:
export const config = {
  runtime: "nodejs",
};

export async function POST(request: NextRequest) {
  let event;
  let rawBody = "";

  try {
    // 1. read the raw body as text
    rawBody = await request.text();
  } catch (err) {
    console.error("Error reading raw body:", err);
    return NextResponse.json(
      { error: "Unable to read request body" },
      { status: 400 }
    );
  }

  // 2. fetch the signature from the header
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  // 3. verify and construct the event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Error verifying Stripe webhook signature:", err);
    return NextResponse.json(
      { error: "Signature verification failed" },
      { status: 400 }
    );
  }

  // 4. handle the event
  const { type } = event;
  // ... your event handling code

  // 5. return success
  return NextResponse.json({ received: true }, { status: 200 });
}
