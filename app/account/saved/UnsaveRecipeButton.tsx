'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { unsaveRecipe } from "./actions"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface UnsaveRecipeButtonProps {
  savedRecipeId: string
  className?: string
  recipeName: string
}

export function UnsaveRecipeButton({ 
  savedRecipeId, 
  className,
  recipeName 
}: UnsaveRecipeButtonProps) {
  const [isPending, setIsPending] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleUnsave = async () => {
    try {
      setIsPending(true)
      await unsaveRecipe(savedRecipeId)
      toast.success('Recipe removed from collection')
    } catch (error) {
      toast.error('Failed to remove recipe')
    } finally {
      setIsPending(false)
      setIsOpen(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`text-destructive hover:bg-destructive/10 ${className}`}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove recipe</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Saved Recipe</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove &quot;{recipeName}&quot; from your saved recipes? 
            This action cannot be undone, and any notes you&apos;ve added will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUnsave}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? "Removing..." : "Remove Recipe"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 