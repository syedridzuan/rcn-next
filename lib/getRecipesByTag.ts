// lib/getRecipesByTag.ts

import { prisma } from "@/lib/db";

/**
 * Retrieve paginated recipes that match a given tag slug,
 * *only* published recipes, ordered by publishedAt desc.
 *
 * @param slug     - The slug of the tag (e.g. "kuih-muih")
 * @param page     - The current page number (defaults to 1)
 * @param pageSize - Number of recipes per page (defaults to 10)
 * @returns { recipes, totalCount }
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

  // 2. Now find recipes that have that tag *and* are published
  const [recipes, totalCount] = await Promise.all([
    prisma.recipe.findMany({
      where: {
        status: "PUBLISHED",
        tags: {
          some: { id: tagRecord.id },
        },
      },
      // Only published => order by publishedAt desc
      orderBy: { publishedAt: "desc" },
      skip,
      take,
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
    }),

    prisma.recipe.count({
      where: {
        status: "PUBLISHED",
        tags: {
          some: { id: tagRecord.id },
        },
      },
    }),
  ]);

  return { recipes, totalCount };
}
