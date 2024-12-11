'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { unsaveRecipe } from "./actions"
import { toast } from "sonner"

interface UnsaveRecipeButtonProps {
  savedRecipeId: string
  className?: string
}

export function UnsaveRecipeButton({ savedRecipeId, className }: UnsaveRecipeButtonProps) {
  const [isPending, setIsPending] = useState(false)

  const handleUnsave = async () => {
    try {
      setIsPending(true)
      await unsaveRecipe(savedRecipeId)
      toast.success('Recipe removed from saved collection')
    } catch (error) {
      toast.error('Failed to remove recipe')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      disabled={isPending}
      onClick={handleUnsave}
      className={className}
    >
      <Bookmark className="h-4 w-4" />
    </Button>
  )
} 