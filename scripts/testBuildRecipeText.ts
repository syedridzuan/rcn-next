#!/usr/bin/env tsx

/**
 * scripts/testBuildRecipeText.ts
 *
 * Usage:
 *   npx tsx scripts/testBuildRecipeText.ts
 *
 * Purpose:
 *   Demonstrates a direct call to `buildRecipeText()` with mock data,
 *   then prints the resulting string to the console for debug.
 */

import { buildRecipeText } from "@/lib/buildRecipeText";

// This interface should match or be compatible with your JoinedRecipe shape.
interface JoinedRecipe {
  id: string;
  title: string;
  description?: string | null;
  shortDescription?: string | null;
  category?: {
    name: string;
  } | null;
  sections?: {
    type: string; // "INGREDIENTS", "INSTRUCTIONS", etc.
    title?: string;
    items?: { content: string }[];
  }[];
  tips?: { content: string }[];
  tags?: { name: string }[];
}

async function main() {
  console.log("=== Testing buildRecipeText ===\n");

  // 1. Create a mock “JoinedRecipe” object (or fetch from DB if you prefer)
  const mockRecipe: JoinedRecipe = {
    id: "abc123",
    title: "Apam Kukus Coklat",
    description:
      "Apam Kukus versi Coklat yang gebu dan lembap. Sangat sesuai untuk majlis keramaian!",
    shortDescription: "Kek apam kukus chocolatey.",
    category: { name: "Kek & Roti" },
    sections: [
      {
        type: "INGREDIENTS",
        title: "Bahan Utama",
        items: [
          { content: "2 cawan tepung gandum" },
          { content: "1 cawan serbuk koko" },
          { content: "1 cawan gula" },
        ],
      },
      {
        type: "INSTRUCTIONS",
        title: "Penyediaan",
        items: [
          { content: "Campurkan semua bahan kering." },
          { content: "Masukkan air sedikit demi sedikit sambil kacau rata." },
          { content: "Kukus dalam loyang selama 30 minit." },
        ],
      },
    ],
    tips: [
      { content: "Pastikan api sederhana supaya apam naik dengan sekata." },
      { content: "Boleh tambah topping coklat cair untuk hiasan." },
    ],
    tags: [
      { name: "apam" },
      { name: "kuih" },
      { name: "coklat" },
      { name: "dessert" },
    ],
  };

  // 2. Call buildRecipeText with the mock data
  const result = buildRecipeText(mockRecipe);

  // 3. Print out the resulting text for debug
  console.log("=== buildRecipeText Output ===");
  console.log(result);
  console.log("=== End ===\n");
}

// Execute main, capturing errors
main().catch((err) => {
  console.error("Error in testBuildRecipeText script:", err);
  process.exit(1);
});
