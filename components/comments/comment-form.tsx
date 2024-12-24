"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
// ... other necessary imports ...

interface CommentFormProps {
  recipeId: string;
  parentId?: string;
  onSubmit: (comment: any) => void;
  onCancel?: () => void;
}

export function CommentForm({
  recipeId,
  parentId,
  onSubmit,
  onCancel,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsPosting(true);

    try {
      const payload = {
        content,
        recipeId,
        parentId,
      };
      // POST the comment
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // If not OK, parse out server error and throw it
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // If the server returned { success: false, error: "..."},
        // we can throw errorData.error. Otherwise throw a default.
        throw new Error(
          errorData?.error || "An unknown error occurred. Please try again."
        );
      }

      // Otherwise parse the comment returned
      const comment = await response.json();
      // Inform the parent so it can re-render the comment list
      onSubmit(comment);
      setContent("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsPosting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-red-600 bg-red-50 rounded-md" role="alert">
          {error}
        </div>
      )}

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Tulis komen anda..."
        disabled={isPosting}
      />

      <div className="flex gap-2">
        <Button type="submit" disabled={isPosting}>
          {isPosting ? "Posting..." : "Post Comment"}
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isPosting}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
