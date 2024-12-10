'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { ImageUploader } from './image-uploader'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Star, Trash } from 'lucide-react'

interface GuideImage {
  id: string
  url: string
  isPrimary: boolean
  alt?: string | null
}

interface ImageManagerProps {
  guideId: string
  initialImages: GuideImage[]
}

export function ImageManager({ guideId, initialImages }: ImageManagerProps) {
  const [images, setImages] = useState<GuideImage[]>(initialImages)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async (imageId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/guides/${guideId}/images/${imageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete image')

      setImages(images.filter(img => img.id !== imageId))
      toast({
        title: 'Success',
        description: 'Image deleted successfully',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete image',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetPrimary = async (imageId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/guides/${guideId}/images/${imageId}/primary`, {
        method: 'PATCH',
      })

      if (!response.ok) throw new Error('Failed to set primary image')

      setImages(images.map(img => ({
        ...img,
        isPrimary: img.id === imageId,
      })))

      toast({
        title: 'Success',
        description: 'Primary image updated',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update primary image',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadComplete = (newImage: GuideImage) => {
    setImages(prev => [...prev, newImage])
    toast({
      title: 'Success',
      description: 'Image uploaded successfully',
    })
  }

  return (
    <div className="space-y-8">
      <ImageUploader 
        guideId={guideId} 
        onUploadComplete={handleUploadComplete}
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <Card key={image.id}>
            <CardHeader className="relative">
              <CardTitle className="sr-only">Guide Image</CardTitle>
              {image.isPrimary && (
                <div className="absolute top-2 left-2 z-10">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </div>
              )}
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <Image
                  src={image.url}
                  alt={image.alt || 'Guide image'}
                  fill
                  className="object-cover"
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground truncate">
                {image.alt || 'No description'}
              </p>
            </CardContent>
            <CardFooter className="justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={image.isPrimary || isLoading}
                onClick={() => handleSetPrimary(image.id)}
              >
                Set as Primary
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDelete(image.id)}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
} 