'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { saveRecipe, unsaveRecipe } from "./actions"
import { toast } from "sonner"

interface SaveRecipeButtonProps {
  recipeId: string
  savedRecipeId?: string | null
  className?: string
}

export function SaveRecipeButton({ recipeId, savedRecipeId, className }: SaveRecipeButtonProps) {
  const [isPending, setIsPending] = useState(false)
  const [isSaved, setIsSaved] = useState(Boolean(savedRecipeId))

  const handleToggleSave = async () => {
    try {
      setIsPending(true)
      
      if (isSaved && savedRecipeId) {
        await unsaveRecipe(savedRecipeId)
        toast.success('Recipe removed from your collection')
        setIsSaved(false)
      } else {
        await saveRecipe(recipeId)
        toast.success('Recipe saved to your collection')
        setIsSaved(true)
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsPending(false)
    }
  }

  return (
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
  )
} 