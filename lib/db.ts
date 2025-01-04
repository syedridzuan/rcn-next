// lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // log: ["query"], // optional for debugging
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Retrieve a paginated list of recipes with optional filters:
 * - page, pageSize
 * - search (title or shortDescription)
 * - difficulty
 * - categoryId
 * - sortBy, sortDirection
 */
export async function getAllRecipes({
  page = 1,
  pageSize = 10,
  search = "",
  difficulty = "",
  categoryId = "",
  sortBy = "createdAt",
  sortDirection = "desc",
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  difficulty?: string; // "EASY","MEDIUM","HARD","EXPERT" if you're matching the enum
  categoryId?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
} = {}) {
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // Build a 'where' object for Prisma
  const whereClause: any = {
    status: "PUBLISHED", // or whichever status you want
  };

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { shortDescription: { contains: search, mode: "insensitive" } },
    ];
  }
  if (difficulty) {
    whereClause.difficulty = difficulty;
  }
  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  // Count total recipes for pagination
  const totalCount = await prisma.recipe.count({
    where: whereClause,
  });

  // Query recipe data
  const recipes = await prisma.recipe.findMany({
    where: whereClause,
    skip,
    take,
    orderBy: {
      [sortBy]: sortDirection,
    },
    include: {
      category: true, // If you want the category info
      tags: true, // If you want the recipe’s tags
    },
  });

  return {
    recipes,
    totalCount,
    currentPage: page,
    pageSize,
  };
}

/**
 * Retrieve all categories, sorted by name.
 * We only need "id", "name", and "description" for the filter UI, for example.
 */
export async function getAllCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc", // previously "title" => now "name"
      },
      select: {
        id: true,
        name: true, // also changed from "title" => "name"
        description: true,
      },
    });
    return categories || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  } finally {
    // If you want to free up connections, but be mindful in serverless envs
    await prisma.$disconnect();
  }
}

export async function getLatestRecipes() {
  return prisma.recipe.findMany({
    where: {
      status: 'PUBLISHED',
    },
    include: {
      images: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 12, // Limit to most recent 12 recipes
  });
}

export async function getPopularRecipes(sortBy: "views" | "likes" = "views") {
  return prisma.recipe.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: {
      images: true,
    },
    orderBy: {
      ...(sortBy === "views" 
        ? { viewCount: "desc" }
        : { likeCount: "desc" }
      ),
    },
    take: 12,
  });
}
