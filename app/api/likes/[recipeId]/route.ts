// app/api/likes/[recipeId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth"; // NextAuth v5 server-side

export async function GET(
  request: NextRequest,
  context: { params: { recipeId: string } }
) {
  // In Next.js 15, `context.params` might be a Promise
  // so you must do this:
  const { recipeId } = await context.params;

  if (!recipeId) {
    return NextResponse.json({ error: "Missing recipeId" }, { status: 400 });
  }

  // 1. Try to find the recipe
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { likeCount: true },
  });
  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  // 2. Check if user is logged in & whether they have liked
  let alreadyLiked = false;
  const session = await auth();
  if (session?.user?.id) {
    const userLike = await prisma.userLikes.findUnique({
      where: {
        userId_recipeId: {
          userId: session.user.id,
          recipeId,
        },
      },
    });
    alreadyLiked = !!userLike;
  }

  return NextResponse.json({
    likeCount: recipe.likeCount || 0,
    alreadyLiked,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { recipeId: string } }
) {
  const recipeId = await params.recipeId;
  if (!recipeId) {
    return NextResponse.json({ error: "Missing recipeId" }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const userId = session.user.id;

  // 1. Check if user already liked
  const existingLike = await prisma.userLikes.findUnique({
    where: {
      userId_recipeId: {
        userId,
        recipeId,
      },
    },
  });
  if (existingLike) {
    return NextResponse.json(
      { error: "You already liked this recipe." },
      { status: 400 }
    );
  }

  // 2. Create the record in userLikes
  await prisma.userLikes.create({
    data: {
      userId,
      recipeId,
    },
  });

  // 3. Increment the recipe’s likeCount in the DB (or ephemeral in Redis)
  const updatedRecipe = await prisma.recipe.update({
    where: { id: recipeId },
    data: {
      likeCount: { increment: 1 },
    },
    select: { likeCount: true },
  });

  return NextResponse.json({
    likeCount: updatedRecipe.likeCount || 0,
    alreadyLiked: true,
  });
}
