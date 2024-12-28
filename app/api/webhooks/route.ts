// app/api/webhooks/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import crypto from "crypto";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import {
  sendSetPasswordEmail,
  sendPaymentConfirmationEmail,
} from "@/lib/email";

export const config = {
  runtime: "nodejs",
};

export async function POST(request: NextRequest) {
  let rawBody: string;
  try {
    // 1. Read raw request body to validate Stripe signature
    rawBody = await request.text();
    console.log("Webhook raw body length:", rawBody.length);
  } catch (err) {
    console.error("Error reading raw body:", err);
    return NextResponse.json(
      { error: "Unable to read request body" },
      { status: 400 }
    );
  }

  // 2. Verify the Stripe signature
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    console.error("Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log(
      `✅ Successfully verified Stripe signature. Event: ${event.type}, ID: ${event.id}`
    );
  } catch (err) {
    console.error("Error verifying Stripe webhook signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 3. Handle the event
  try {
    console.log("Handling event type:", event.type);

    switch (event.type) {
      /**
       * checkout.session.completed
       *
       * Fires when a user completes a Checkout Session for a subscription or payment.
       * Typically used to create or update your local Subscription record.
       */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("checkout.session.completed -> Session object:", session);

        // 1. Attempt to find user by metadata.userId or fallback to email-based logic
        let user = null;
        let isNewUser = false;

        // If userId was stored in metadata by /api/subscribe-existing-user
        if (session.metadata?.userId) {
          console.log("Session metadata userId:", session.metadata.userId);
          user = await prisma.user.findUnique({
            where: { id: session.metadata.userId },
          });
          if (user) {
            console.log(
              `Found existing user by userId: ${user.id} (${
                user.email || "no email"
              })`
            );
          } else {
            console.warn("No user found with that userId in DB.");
          }
        }

        // If no user or no userId, fallback to email approach
        const email =
          session.metadata?.email || session.customer_details?.email || null;
        console.log("Derived email from session:", email);

        if (!user) {
          if (!email) {
            console.warn(
              "No userId or email found in checkout session. Cannot create user or subscription."
            );
            break; // We stop here because we have no way to link a user
          }

          // Try find by email
          user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            isNewUser = true;
            user = await prisma.user.create({
              data: {
                email,
                status: "ACTIVE", // or your default status
                // username: `user_${Math.floor(Math.random() * 1_000_000)}`, // optional
              },
            });
            console.log(`Created new user with email: ${email}`);
          } else {
            console.log(
              `Found existing user by email: ${user.id} (${user.email})`
            );
          }
        } else {
          // Optionally update user’s missing email if session has it
          if (email && !user.email) {
            await prisma.user.update({
              where: { id: user.id },
              data: { email },
            });
            console.log(`Backfilled email for existing user ${user.id}`);
          }
        }

        // 2. Extract subscription ID from the Checkout Session (if mode="subscription")
        const stripeSubId = session.subscription;
        if (!stripeSubId) {
          console.warn(
            "No subscription ID found in session object (maybe a one-time payment?)."
          );
          break;
        }
        console.log("Stripe subscription ID:", stripeSubId);

        // 3. Check if we already have a local Subscription
        let subscription = await prisma.subscription.findFirst({
          where: {
            userId: user.id,
            stripeSubscriptionId: String(stripeSubId),
          },
        });

        // 4. Create or update Subscription
        if (!subscription) {
          subscription = await prisma.subscription.create({
            data: {
              userId: user.id,
              stripeSubscriptionId: String(stripeSubId),
              plan: "BASIC", // or session.metadata?.plan
              status: "ACTIVE",
              startDate: new Date(),
            },
          });
          console.log(
            `Created new subscription for user ${user.id} / subID: ${stripeSubId}`
          );
        } else {
          console.log(
            `Found existing subscription (ID: ${subscription.id}). Updating status to ACTIVE.`
          );
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: "ACTIVE" },
          });
          console.log(`Updated subscription status for user ${user.id}`);
        }

        // 5. Send Payment Confirmation Email
        const toEmail = user.email || email;
        if (toEmail) {
          console.log("Calling sendPaymentConfirmationEmail for:", toEmail);
          try {
            await sendPaymentConfirmationEmail(toEmail);
            console.log(`Payment Confirmation email sent to ${toEmail}`);
          } catch (err) {
            console.error("Error sending Payment Confirmation email:", err);
          }
        }

        // 6. If this is a brand-new user, generate a token for "Set Password" flow
        if (isNewUser && user.email) {
          console.log(
            "This user is brand new. Generating set-password token..."
          );
          const rawToken = crypto.randomBytes(32).toString("hex");
          const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hrs

          await prisma.verificationToken.create({
            data: {
              identifier: user.email,
              token: rawToken,
              expires,
            },
          });
          console.log(
            `Created verificationToken in DB with token: ${rawToken} expires: ${expires}`
          );

          try {
            await sendSetPasswordEmail(user.email, rawToken);
            console.log(`Sent set-password email to ${user.email}`);
          } catch (emailError) {
            console.error("Error sending set-password email:", emailError);
          }
        }

        break;
      }

      /**
       * invoice.payment_succeeded
       *
       * Fires whenever a subscription invoice is successfully paid.
       * Great place to update local subscription’s `currentPeriodEnd`.
       */

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) {
          console.warn("No subscription ID on invoice.");
          break;
        }

        // Retrieve the subscription from Stripe
        const sub = await stripe.subscriptions.retrieve(
          String(invoice.subscription)
        );
        console.log(
          `Stripe subscription ID on invoice: ${sub.id}, current_period_end: ${sub.current_period_end}`
        );

        // Check if you have a local subscription record
        const localSub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });
        if (!localSub) {
          console.warn(
            "No local subscription record found for this subscription."
          );
          break;
        }

        // Update your DB with sub.current_period_end
        await prisma.subscription.update({
          where: { id: localSub.id },
          data: {
            status: "ACTIVE", // or sub.status mapping
            currentPeriodEnd: sub.current_period_end
              ? new Date(sub.current_period_end * 1000)
              : null,
          },
        });

        console.log(
          `Subscription ${localSub.id} updated with invoice period end = ${sub.current_period_end}`
        );
        break;
      }

      /**
       * invoice.payment_failed
       *
       * The customer failed to pay the invoice => subscription might move to PAST_DUE.
       */
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`Payment failed for invoice ${invoice.id}`);

        // Optionally update subscription to "PAST_DUE" or "SUSPENDED" or "EXPIRED"
        // e.g. find local record -> subscription.status = 'PAST_DUE'
        break;
      }

      /**
       * customer.subscription.updated
       *
       * Fires when the subscription is changed in some way on Stripe’s side
       * (e.g. user changes plan, or next billing date changes).
       */
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        console.log(`Subscription updated in Stripe: ${sub.id}`);
        console.log("New subscription info:", sub);

        // Optionally update plan or period in DB
        // For example:
        // const updated = await prisma.subscription.updateMany({
        //   where: { stripeSubscriptionId: sub.id },
        //   data: {
        //     plan: sub.items?.data[0]?.price?.nickname || 'BASIC',
        //     currentPeriodEnd: sub.current_period_end
        //       ? new Date(sub.current_period_end * 1000)
        //       : null,
        //   },
        // });
        // console.log(`Local subscription records updated: ${updated}`);
        break;
      }

      /**
       * customer.subscription.deleted
       *
       * The subscription has been canceled or expired. Mark it as canceled locally.
       */
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        console.log(`Subscription deleted in Stripe: ${sub.id}`);

        const updated = await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "CANCELLED" },
        });
        console.log(
          `Set local subscription to CANCELLED. Rows updated: ${updated}`
        );
        break;
      }

      /**
       * Unhandled event => log it for debugging
       */
      default: {
        console.log(`Unhandled event type: ${event.type}`);
      }
    }

    // Acknowledge receipt of the event
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error(`Webhook handler error for event ${event.type}:`, err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
