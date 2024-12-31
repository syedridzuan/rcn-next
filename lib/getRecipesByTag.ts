// lib/getRecipesByTag.ts
import { prisma } from "@/lib/db";

// Customize pageSize (e.g. 10) to your preference
const PAGE_SIZE = 10;

interface GetRecipesByTagParams {
  slug: string;
  page?: number;
}

export async function getRecipesByTag({
  slug,
  page = 1,
}: GetRecipesByTagParams) {
  // Calculate skip/offset for pagination
  const skip = (page - 1) * PAGE_SIZE;

  // 1. Find Tag record by slug
  const tag = await prisma.tag.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!tag) return { recipes: [], totalCount: 0 };

  // 2. Find all recipes with this tag
  const [recipes, totalCount] = await Promise.all([
    prisma.recipe.findMany({
      where: {
        tags: {
          some: {
            id: tag.id,
          },
        },
        status: "PUBLISHED", // or whichever status means "visible"
      },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        // Add other fields as needed
        createdAt: true,
        // e.g. rating or image
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.recipe.count({
      where: {
        tags: {
          some: {
            id: tag.id,
          },
        },
        status: "PUBLISHED",
      },
    }),
  ]);

  return { recipes, totalCount };
}
