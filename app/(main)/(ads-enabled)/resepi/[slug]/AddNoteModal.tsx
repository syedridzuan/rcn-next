'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { updateSavedRecipeNotes } from "./actions"
import { toast } from "sonner"

interface AddNoteModalProps {
  savedRecipeId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  existingNote?: string | null
}

export function AddNoteModal({ 
  savedRecipeId, 
  open, 
  onOpenChange,
  existingNote 
}: AddNoteModalProps) {
  const [note, setNote] = useState(existingNote || '')
  const [isPending, setIsPending] = useState(false)

  const handleSave = async () => {
    try {
      setIsPending(true)
      await updateSavedRecipeNotes(savedRecipeId, note)
      toast.success('Note saved successfully')
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to save note')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Note to Saved Recipe</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Add your cooking notes, modifications, or reminders..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[150px]"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isPending}
          >
            Save Note
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 