"use client";

import * as React from "react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast"; // <--- For shadcn toasts
import { updateNotificationPreferences } from "./actions";

interface NotificationFormProps {
  initialNewsletter: boolean;
  initialCommentReply: boolean;
  initialRecipeComment: boolean;
}

export default function NotificationForm({
  initialNewsletter,
  initialCommentReply,
  initialRecipeComment,
}: NotificationFormProps) {
  const [newsletter, setNewsletter] = React.useState(initialNewsletter);
  const [commentReply, setCommentReply] = React.useState(initialCommentReply);
  const [recipeComment, setRecipeComment] =
    React.useState(initialRecipeComment);

  // For "saving" or "pending" feedback
  const [isPending, startTransition] = useTransition();

  // Use shadcn/ui's toast
  const { toast } = useToast();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        // Perform server-side update
        await updateNotificationPreferences({
          subscribeNewsletter: newsletter,
          subscribeCommentReply: commentReply,
          subscribeRecipeComment: recipeComment,
        });
        // Show success toast
        toast({
          title: "Preferences Saved",
          description: "Your notification settings have been updated.",
        });
      } catch (error) {
        // Optionally show error toast or other UI
        toast({
          title: "Error",
          description: "Failed to update your notification settings.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Newsletter */}
      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor="newsletter" className="text-sm font-medium">
          Receive Newsletter
        </Label>
        <Switch
          id="newsletter"
          checked={newsletter}
          onCheckedChange={setNewsletter}
        />
      </div>

      {/* Comment Reply */}
      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor="comment-reply" className="text-sm font-medium">
          Notify on Comment Replies
        </Label>
        <Switch
          id="comment-reply"
          checked={commentReply}
          onCheckedChange={setCommentReply}
        />
      </div>

      {/* Recipe Comment */}
      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor="recipe-comment" className="text-sm font-medium">
          Notify on New Comments on My Recipes
        </Label>
        <Switch
          id="recipe-comment"
          checked={recipeComment}
          onCheckedChange={setRecipeComment}
        />
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
