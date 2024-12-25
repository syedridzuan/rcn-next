// lib/stripe.ts
import Stripe from "stripe";

// Ensure the Stripe secret key is set in environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

// Initialize the Stripe client with the secret key and API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia", // Use the latest API version
});
