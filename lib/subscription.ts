// /lib/subscription.ts
import { prisma } from "@/lib/db";

/**
 * Check if a user currently has an active subscription.
 *
 * Requirements (you can adjust to your business logic):
 *  - subscription.status === "ACTIVE"
 *  - subscription.currentPeriodEnd is either NULL (no set end) or is in the future
 *  - subscription.cancelAtPeriodEnd is false, if you want to exclude those
 *
 * @param userId The user's ID
 * @returns A boolean indicating if the user has any valid subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  // 1. Find an active subscription for the user.
  //    This is just an example query; adapt to your actual logic.
  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      // e.g. if you want them not canceled at period end:
      cancelAtPeriodEnd: false,
      // check if currentPeriodEnd is in the future, or is null
      // meaning no set end date, or not expired
      OR: [
        { currentPeriodEnd: null },
        { currentPeriodEnd: { gte: new Date() } },
      ],
    },
    select: { id: true }, // we only need to know it exists
  });

  // 2. Return true if found, false if not
  return Boolean(sub);
}
