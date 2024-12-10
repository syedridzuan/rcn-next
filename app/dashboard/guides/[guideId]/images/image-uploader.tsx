'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Upload } from 'lucide-react'

interface ImageUploaderProps {
  guideId: string
  onUploadComplete: (image: any) => void
}

export function ImageUploader({ guideId, onUploadComplete }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    
    if (!formData.get('image')) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an image to upload',
      })
      return
    }

    setIsUploading(true)

    try {
      const response = await fetch(`/api/guides/${guideId}/images`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to upload image')

      const image = await response.json()
      onUploadComplete(image)
      event.target.reset()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to upload image',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="image">Image</Label>
        <Input
          ref={fileInputRef}
          id="image"
          name="image"
          type="file"
          accept="image/*"
        />
      </div>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="alt">Alt Text</Label>
        <Input
          id="alt"
          name="alt"
          type="text"
          placeholder="Describe the image"
        />
      </div>
      <Button type="submit" disabled={isUploading}>
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? 'Uploading...' : 'Upload Image'}
      </Button>
    </form>
  )
} 