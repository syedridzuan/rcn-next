import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Fetch categories from Prisma, order them by name (optional)
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    // Transform each Category into the structure your component expects:
    //   { id, label, href, count }
    const mapped = categories.map((cat) => ({
      id: cat.id,
      label: cat.name,
      href: `/kategori/${cat.slug}`,
      count: cat.recipesCount,
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
