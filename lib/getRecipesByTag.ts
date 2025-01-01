// lib/getRecipesByTag.ts

import { prisma } from "@/lib/db";

/**
 * Retrieve paginated recipes that match a given tag slug.
 *
 * @param slug       - The slug of the tag (e.g., "kuih-muih", "pedas")
 * @param page       - The current page number (defaults to 1)
 * @param pageSize   - Number of recipes per page (defaults to 10)
 * @returns An object containing:
 *           { recipes: Recipe[], totalCount: number }
 */
export async function getRecipesByTag({
  slug,
  page = 1,
  pageSize = 10,
}: {
  slug: string;
  page?: number;
  pageSize?: number;
}) {
  // Calculate pagination offsets
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // 1. Query the tag to get its ID
  const tagRecord = await prisma.tag.findUnique({
    where: { slug },
    select: { id: true },
  });

  // If no such tag exists, return empty results
  if (!tagRecord) {
    return { recipes: [], totalCount: 0 };
  }

  // 2. Now find recipes that have that tag
  const [recipes, totalCount] = await Promise.all([
    prisma.recipe.findMany({
      where: {
        tags: {
          some: { id: tagRecord.id },
        },
        // e.g. Only published recipes, if you use a status field:
        // status: "PUBLISHED",
      },
      // Include images so you can display a thumbnail
      // Adjust fields as needed (url, alt, isPrimary, etc.)
      include: {
        images: {
          select: {
            id: true,
            url: true,
            alt: true,
            isPrimary: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),

    prisma.recipe.count({
      where: {
        tags: {
          some: { id: tagRecord.id },
        },
        // status: "PUBLISHED",
      },
    }),
  ]);

  return { recipes, totalCount };
}
