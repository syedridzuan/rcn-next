#!/usr/bin/env tsx
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // The user ID we want to attach the subscription to
  const USER_ID = "cm4tms37g0000ecncek4ugjpd";

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: USER_ID },
  });
  if (!user) {
    throw new Error(`User with ID ${USER_ID} not found.`);
  }

  // Create a sample subscription
  const subscription = await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: "BASIC", // or "STANDARD", "PREMIUM", etc.
      status: "ACTIVE", // e.g. "ACTIVE" or "CANCELLED"
      startDate: new Date(), // e.g. subscription begins now
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      // sets the end date 30 days from now
      cancelAtPeriodEnd: false,
      canceledAt: null,
      // createdAt and updatedAt default automatically
    },
  });

  console.log("Subscription created successfully:");
  console.log(subscription);
}

// Run the seed
main()
  .catch((error) => {
    console.error("Error seeding subscription data:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
