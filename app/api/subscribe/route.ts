import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

// Map your plan name to the corresponding Price ID from Stripe
// (Replace these placeholders with your actual Price IDs)
const PRICE_MAP: Record<string, string> = {
  BASIC: "price_basic_id", // e.g., "price_1AaBbCc..."
  STANDARD: "price_standard_id",
  PREMIUM: "price_premium_id",
};

export async function POST(request: NextRequest) {
  try {
    // Expecting JSON body with { plan: 'BASIC' | 'STANDARD' | 'PREMIUM', customerEmail: string }
    const { plan, customerEmail } = await request.json();

    // Validate plan
    const priceId = PRICE_MAP[plan];
    if (!priceId) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // Create a subscription-based Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Optionally pre-fill the customer's email
      customer_email: customerEmail,
      // Update your success & cancel URLs here:
      success_url: `${request.headers.get("origin")}/langganan/berjaya`,
      cancel_url: `${request.headers.get("origin")}/langganan/batal`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating subscription session:", error);
    return NextResponse.json(
      { error: "Server error while creating session" },
      { status: 500 }
    );
  }
}
