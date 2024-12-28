import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered, please log in" },
        { status: 409 }
      );
    }

    // Replace with your own Price ID
    const BASIC_PRICE_ID = "price_1Qa7OBPEbzb3ZoaowEYUKz2a";

    // Create the Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: BASIC_PRICE_ID, quantity: 1 }],
      customer_email: email,
      metadata: { email },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/langganan/berjaya`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/langganan/batal`,
    });

    // ❗ Return session.url (not just session.id)
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating subscription session:", error);
    return NextResponse.json(
      { error: "Failed to create subscription session" },
      { status: 500 }
    );
  }
}
