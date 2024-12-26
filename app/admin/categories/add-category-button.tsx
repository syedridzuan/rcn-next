'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function AddCategoryButton() {
  const router = useRouter()

  return (
    <Link 
      href="/dashboard/categories/new"
      onClick={() => {
        toast.promise(
          // This is just to show the loading state
          new Promise((resolve) => setTimeout(resolve, 500)),
          {
            loading: 'Navigating to add category...',
            success: 'Ready to add a new category',
            error: 'Navigation failed'
          }
        )
      }}
    >
      <Button>Add New Category</Button>
    </Link>
  )
} 