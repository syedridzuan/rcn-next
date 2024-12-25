// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      // If you want to charge in MYR:
      line_items: items.map(
        (item: { name: string; price: number; quantity: number }) => ({
          price_data: {
            // Use MYR for Malaysian Ringgit
            currency: "myr",
            product_data: {
              name: item.name,
            },
            // item.price is in sen for MYR. e.g. RM36.00 => 3600
            unit_amount: item.price,
          },
          quantity: item.quantity,
        })
      ),

      mode: "payment",
      success_url: `${request.headers.get("origin")}/success`,
      cancel_url: `${request.headers.get("origin")}/cancel`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
