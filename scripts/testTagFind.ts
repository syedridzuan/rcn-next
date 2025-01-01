#!/usr/bin/env tsx
/**
 * scripts/testTagFind.ts
 *
 * Usage:
 *   npx tsx scripts/testTagFind.ts
 *
 * Make sure you have your .env for Prisma configured
 * and `prisma` is properly imported from '@/lib/db' or wherever you store it.
 */

import { prisma } from "@/lib/db";

async function main() {
  const tag = await prisma.tag.findUnique({
    where: { slug: "kuih-tradisional" },
    select: { id: true },
  });

  if (tag) {
    console.log("Found Tag ID:", tag.id);
  } else {
    console.log("No tag found for slug 'kuih-tradisional'.");
  }
}

main()
  .catch((err) => {
    console.error("Error:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
