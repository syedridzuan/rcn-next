'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, X, Check } from "lucide-react"
import { updateSavedRecipeNotes } from "./actions"
import { toast } from "sonner"

interface EditNoteButtonProps {
  savedRecipeId: string
  initialNote: string | null
}

export function EditNoteButton({ savedRecipeId, initialNote }: EditNoteButtonProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [note, setNote] = useState(initialNote || '')
  const [isPending, setIsPending] = useState(false)

  const handleSave = async () => {
    try {
      setIsPending(true)
      await updateSavedRecipeNotes(savedRecipeId, note)
      toast.success('Note updated successfully')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update note')
    } finally {
      setIsPending(false)
    }
  }

  const handleCancel = () => {
    setNote(initialNote || '')
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => setIsEditing(true)}
      >
        <Pencil className="h-4 w-4" />
        <span className="sr-only">Edit note</span>
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add your cooking notes..."
        className="min-h-[100px] resize-none border-primary"
      />
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={isPending}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isPending}
        >
          <Check className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  )
} 