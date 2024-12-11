import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { ModerationActions } from "./moderation-actions"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function getPendingComments() {
  const comments = await prisma.comment.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      recipe: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return comments
}

export default async function ModerationPage() {
  // Check if user is authenticated and is an admin
  const session = await auth()
  if (!session?.user?.role === "ADMIN") {
    redirect("/")
  }

  const pendingComments = await getPendingComments()

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Comment Moderation</h1>
        <span className="text-muted-foreground">
          {pendingComments.length} pending comments
        </span>
      </div>

      {pendingComments.length === 0 ? (
        <div className="rounded-lg bg-muted p-8 text-center">
          <p className="text-muted-foreground">No pending comments to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingComments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border p-4 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {comment.user.name || "Anonymous"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    on{" "}
                    <a
                      href={`/resepi/${comment.recipe.slug}`}
                      className="hover:underline"
                    >
                      {comment.recipe.title}
                    </a>
                  </p>
                </div>
                <ModerationActions commentId={comment.id} />
              </div>
              <div className="rounded bg-muted p-4">
                <p className="whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 