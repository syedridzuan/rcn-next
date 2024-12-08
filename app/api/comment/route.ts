// app/api/comments/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

// Create a new ratelimiter instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests per minute
});

// Comment validation schema
const CommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment is too long")
    .trim(),
  recipeId: z.string().uuid(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Rate limiting
    const ip = headers().get("x-forwarded-for") ?? "127.0.0.1";
    const { success, pending, limit, reset, remaining } = await ratelimit.limit(
      `comments_${ip}`
    );

    if (!success) {
      return new NextResponse("Too many requests", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      });
    }

    const body = await req.json();

    // Validate input
    const result = CommentSchema.safeParse(body);
    if (!result.success) {
      return new NextResponse(
        JSON.stringify({
          message: "Invalid input",
          errors: result.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if recipe exists
    const recipe = await db.recipe.findUnique({
      where: { id: result.data.recipeId },
    });

    if (!recipe) {
      return new NextResponse(
        JSON.stringify({
          message: "Recipe not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create comment with transaction to ensure data consistency
    const comment = await db.$transaction(async (tx) => {
      // Check user's recent comments to prevent spam
      const recentComments = await tx.comment.count({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: new Date(Date.now() - 60000), // Last minute
          },
        },
      });

      if (recentComments >= 5) {
        throw new Error("Too many comments in a short time");
      }

      return tx.comment.create({
        data: {
          content: result.data.content,
          recipeId: result.data.recipeId,
          userId: session.user.id,
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("[COMMENTS_POST]", error);

    if (error instanceof Error) {
      return new NextResponse(
        JSON.stringify({
          message: error.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: "Internal Server Error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Get comments for a recipe
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const recipeId = searchParams.get("recipeId");

    if (!recipeId) {
      return new NextResponse("Recipe ID is required", { status: 400 });
    }

    const comments = await db.comment.findMany({
      where: {
        recipeId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("[COMMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
