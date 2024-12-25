"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import type { CommentWithUser } from "@/types/comments";

import { Button } from "@/components/ui/button";
import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";

interface CommentsWrapperProps {
  recipeId: string;
  // We remove initialComments or keep it optional
}

export function CommentsWrapper({ recipeId }: CommentsWrapperProps) {
  const { data: session } = useSession();

  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Fetch comments from `/api/comments?recipeId=...`
  async function fetchComments() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/comments?recipeId=${recipeId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch comments: ${res.status}`);
      }
      const data = await res.json();
      if (!data || data.success === false) {
        throw new Error(data?.error || "Unknown error fetching comments");
      }
      // data.data is presumably the array of comments
      const commentsFromAPI: CommentWithUser[] = data.data || [];
      setComments(commentsFromAPI);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown fetch error");
      console.error("[CommentsWrapper] fetchComments error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // On mount, load comments
  useEffect(() => {
    fetchComments();
  }, [recipeId]);

  // This function is called after a new comment is posted successfully
  const handleCommentSubmit = async (newComment: CommentWithUser) => {
    // You can EITHER re-fetch from server (to get the updated comment list)
    // or manually insert into local state. We’ll do the manual approach here:
    if (newComment.parentId) {
      // It's a reply
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === newComment.parentId
            ? {
                ...comment,
                replies: [...(comment.replies || []), newComment],
              }
            : comment
        )
      );
    } else {
      // New top-level comment
      setComments((prev) => [newComment, ...prev]);
    }
    setReplyingTo(null);
  };

  if (isLoading) {
    return <div>Loading comments...</div>;
  }
  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* If not logged in, prompt user to sign in */}
      {!session?.user && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            You need to be logged in to post a comment.
          </p>
          <Button variant="outline" onClick={() => signIn()}>
            Log In
          </Button>
        </div>
      )}

      {/* If user is logged in and not currently replying to a comment, show top-level form */}
      {session?.user && !replyingTo && (
        <CommentForm recipeId={recipeId} onSubmit={handleCommentSubmit} />
      )}

      {/* Render comment list */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-4">
            <CommentItem
              comment={comment}
              onReplyClick={() => setReplyingTo(comment.id)}
              // Only allow reply if top-level and user is logged in
              canReply={!comment.parentId && !!session?.user}
            />

            {/* Show a nested reply form if user clicked "Reply" */}
            {replyingTo === comment.id && (
              <div className="ml-8">
                <CommentForm
                  recipeId={recipeId}
                  parentId={comment.id}
                  onSubmit={handleCommentSubmit}
                  onCancel={() => setReplyingTo(null)}
                />
              </div>
            )}

            {/* Render nested replies if any */}
            {comment.replies?.length ? (
              <div className="ml-8 space-y-4">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    canReply={false}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
