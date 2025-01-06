// File: app/admin/recipes/drafts/DeleteDraftButton.tsx
"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

// ✅ Import from "../actions"
import { deleteDraftRecipeAction } from "./actions";

export default function DeleteDraftButton({ draftId }: { draftId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirmDelete() {
    setError(null);
    // Call server action
    const res = await deleteDraftRecipeAction(draftId);
    if (res?.error) {
      setError(res.error);
    } else {
      setOpen(false); // close dialog
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          className="text-red-600 underline hover:text-red-800 ml-4"
          onClick={() => setOpen(true)}
        >
          Delete
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this draft?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmDelete}>
            Confirm Delete
          </AlertDialogAction>
        </AlertDialogFooter>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </AlertDialogContent>
    </AlertDialog>
  );
}
