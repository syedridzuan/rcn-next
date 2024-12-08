import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { NextRequest } from "next/server"
import { z } from "zod"

const commentSchema = z.object({
  content: z
    .string()
    .min(3, "Comment must be at least 3 characters")
    .max(500, "Comment cannot exceed 500 characters"),
  recipeId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 })
    }

    const json = await request.json()
    const body = commentSchema.parse(json)

    const comment = await prisma.comment.create({
      data: {
        content: body.content,
        recipeId: body.recipeId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    })

    return Response.json(comment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.errors), { status: 400 })
    }

    return new Response("Internal Server Error", { status: 500 })
  }
} 