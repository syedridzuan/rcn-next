'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { saveRecipe, unsaveRecipe } from "./actions"
import { toast } from "sonner"
import { AddNoteModal } from "./AddNoteModal"

interface SaveRecipeButtonProps {
  recipeId: string
  savedRecipeId?: string | null
  className?: string
  existingNote?: string | null
}

export function SaveRecipeButton({ 
  recipeId, 
  savedRecipeId, 
  className,
  existingNote 
}: SaveRecipeButtonProps) {
  const [isPending, setIsPending] = useState(false)
  const [isSaved, setIsSaved] = useState(Boolean(savedRecipeId))
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [currentSavedId, setCurrentSavedId] = useState(savedRecipeId)

  const handleToggleSave = async () => {
    try {
      setIsPending(true)
      
      if (isSaved && currentSavedId) {
        await unsaveRecipe(currentSavedId)
        toast.success('Recipe removed from your collection')
        setIsSaved(false)
        setCurrentSavedId(null)
      } else {
        const result = await saveRecipe(recipeId)
        if (result.success && result.savedRecipeId) {
          setCurrentSavedId(result.savedRecipeId)
          setIsSaved(true)
          toast.success('Recipe saved! Would you like to add a note?', {
            action: {
              label: 'Add Note',
              onClick: () => setShowNoteModal(true)
            },
          })
        }
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={handleToggleSave}
        className={className}
      >
        <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
        {isSaved ? 'Saved' : 'Save Recipe'}
      </Button>

      {currentSavedId && (
        <AddNoteModal
          savedRecipeId={currentSavedId}
          open={showNoteModal}
          onOpenChange={setShowNoteModal}
          existingNote={existingNote}
        />
      )}
    </>
  )
} 