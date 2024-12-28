#!/usr/bin/env tsx
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

async function main() {
  // For demonstration, we generate a random token:
  // (You can replace this with your own token creation logic.)
  const tokenBuffer = randomBytes(32);
  const token = tokenBuffer.toString("hex");

  // Example user email or identifier
  const identifier = "sridzuan@cnstudios.my";

  // Expiry time, e.g., 1 day from now
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Create a VerificationToken record
  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: identifier,
      token: token,
      expires: expires,
    },
  });

  console.log("Sample VerificationToken created:");
  console.log(verificationToken);
}

main()
  .catch((error) => {
    console.error("Error creating verification token:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
