"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ModerationActionsProps {
  commentId: string;
  onSuccess: () => void; // callback from parent
}

export function ModerationActions({
  commentId,
  onSuccess,
}: ModerationActionsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function handleAction(action: "approve" | "reject" | "delete") {
    setIsLoading(true);
    try {
      let url = `/api/moderation/comments/${commentId}`;
      let method: "PATCH" | "DELETE" = "PATCH";
      let body: any = {};

      if (action === "approve") {
        body.status = "APPROVED";
      } else if (action === "reject") {
        body.status = "REJECTED";
      } else if (action === "delete") {
        method = "DELETE";
        body = null;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Unknown error updating comment");
      }

      switch (action) {
        case "approve":
          toast({ title: "Comment approved", variant: "default" });
          break;
        case "reject":
          toast({ title: "Comment rejected", variant: "destructive" });
          break;
        case "delete":
          toast({ title: "Comment deleted", variant: "destructive" });
          break;
      }

      // Re-fetch parent list
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${action} comment`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowRejectDialog(false);
      setShowDeleteDialog(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => handleAction("approve")}
          disabled={isLoading}
        >
          Approve
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowRejectDialog(true)}
          disabled={isLoading}
        >
          Reject
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isLoading}
        >
          Delete
        </Button>
      </div>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this comment? This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => handleAction("reject")}
              disabled={isLoading}
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment permanently?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => handleAction("delete")}
              disabled={isLoading}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
