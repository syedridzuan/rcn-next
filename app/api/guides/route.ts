import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const guides = await prisma.guide.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true, createdAt: true },
  });
  return NextResponse.json(guides);
}
