// lib/subscription.ts (or any filename you prefer)
import { prisma } from "@/lib/db";

/**
 * Returns `true` if the user has an active subscription, otherwise `false`.
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  // 1. Look for a subscription record matching the userId and status=ACTIVE
  const activeSub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE", // adjust if your statuses differ
    },
    // You only need to check existence, so no 'select' is needed
  });

  // 2. Return a boolean indicating whether it was found
  return !!activeSub;
}
