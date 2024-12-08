'use server'

import { prisma } from "@/lib/db"

export async function searchRecipes(query: string, category?: string | null) {
  return await prisma.recipe.findMany({
    where: {
      AND: [
        {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
          ],
        },
        category && category !== 'all' ? { category: { slug: category } } : {},
      ],
    },
    include: {
      category: true,
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
} 