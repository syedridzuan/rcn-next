// app/api/search/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // Adjust your import path

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  // 1. Read the "q" parameter from the query string
  const keyword = (url.searchParams.get("q") ?? "").trim();

  if (!keyword) {
    return NextResponse.json({
      results: [],
      message: "No keyword provided.",
    });
  }

  // 2. Build a simple case-insensitive search in, say, the `title` field
  // You can expand to shortDescription, etc.:
  const recipes = await prisma.recipe.findMany({
    where: {
      title: { contains: keyword, mode: "insensitive" },
      // If you have a "PUBLISHED" status or additional filters, add them:
      status: "PUBLISHED",
    },
    take: 10,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      shortDescription: true,
    },
  });

  return NextResponse.json({
    results: recipes,
    total: recipes.length,
  });
}
