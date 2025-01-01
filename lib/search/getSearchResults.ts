// @/lib/search/getSearchResults.ts
import { prisma } from "@/lib/db";

interface SearchParams {
  keyword?: string;
  difficulty?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Fetches recipes from the database based on optional filters:
 * - `keyword`: performs a case-insensitive match on title or shortDescription.
 * - `difficulty`: matches the difficulty enum (e.g., "EASY", "MEDIUM", etc.).
 * - `categoryId`: matches the Prisma ID for the category.
 * - `page`: pagination page number (1-based).
 * - `pageSize`: how many items per page (default 12).
 *
 * Returns an object:
 *   { recipes: Recipe[], totalCount: number }
 */
export async function getSearchResults({
  keyword = "",
  difficulty = "",
  categoryId = "",
  page = 1,
  pageSize = 12,
}: SearchParams) {
  // 1. Calculate skip/take for pagination
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // 2. Construct a `where` clause for your Prisma query
  const where: any = {
    status: "PUBLISHED", // or whichever status means "public" or "visible"
  };

  // If user typed in a keyword => match title or shortDescription (partial, case-insensitive)
  if (keyword.trim()) {
    where.OR = [
      { title: { contains: keyword.trim(), mode: "insensitive" } },
      { shortDescription: { contains: keyword.trim(), mode: "insensitive" } },
    ];
  }

  // If difficulty is specified, filter by it
  if (difficulty.trim()) {
    // Typically difficulty is an enum like "EASY" | "MEDIUM" | "HARD", etc.
    where.difficulty = difficulty.trim().toUpperCase();
  }

  // If categoryId is specified, filter by that category
  if (categoryId.trim()) {
    where.categoryId = categoryId.trim();
  }

  // 3. Perform the queries in parallel
  const [recipes, totalCount] = await Promise.all([
    prisma.recipe.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        category: true, // or false if you only want the ID
        images: true, // so we can show primary or first image in the search results
      },
    }),
    prisma.recipe.count({ where }),
  ]);

  // 4. Return the data
  return { recipes, totalCount };
}
