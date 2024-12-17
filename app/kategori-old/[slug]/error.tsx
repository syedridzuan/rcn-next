// app/kategori/[slug]/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function CategoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
      <h2 className="mt-4 text-2xl font-semibold">Something went wrong!</h2>
      <p className="mt-2 text-muted-foreground">
        Failed to load category and recipes
      </p>
      <div className="mt-6 flex justify-center gap-4">
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
        <Button asChild>
          <Link href="/kategori">Back to Categories</Link>
        </Button>
      </div>
    </div>
  )
}