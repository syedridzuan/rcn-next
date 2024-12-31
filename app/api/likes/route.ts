// app/api/likes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { redisClient } from "@/lib/redis";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const recipeId = searchParams.get("recipeId");
  if (!recipeId) {
    return NextResponse.json({ error: "Missing recipeId" }, { status: 400 });
  }

  try {
    // 1. Fetch existing likeCount from your DB
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { likeCount: true },
    });
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // 2. Fetch ephemeral likes from Redis
    const ephemeralLikes =
      (await redisClient.hget<number>("recipe:likes", recipeId)) || 0;

    // 3. Sum them
    const totalLikes = (recipe.likeCount || 0) + ephemeralLikes;

    return NextResponse.json({ likes: totalLikes });
  } catch (error) {
    console.error("Error fetching likes:", error);
    return NextResponse.json(
      { error: "Failed to fetch likes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { recipeId } = await request.json();
    if (!recipeId) {
      return NextResponse.json({ error: "Missing recipeId" }, { status: 400 });
    }

    // 1. Increment ephemeral likes in Redis
    await redisClient.hincrby("recipe:likes", recipeId, 1);

    // 2. Get ephemeral from Redis
    const ephemeralLikes =
      (await redisClient.hget<number>("recipe:likes", recipeId)) || 0;

    // 3. Get DB baseline
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { likeCount: true },
    });

    // 4. Sum
    const totalLikes = (recipe?.likeCount || 0) + ephemeralLikes;

    return NextResponse.json({ likes: totalLikes });
  } catch (error) {
    console.error("Error incrementing likes in Redis:", error);
    return NextResponse.json(
      { error: "Failed to increment likes" },
      { status: 500 }
    );
  }
}
