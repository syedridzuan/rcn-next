'use client';

import { useRecipeImages } from '@/hooks/use-recipe-images';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  recipeId: string;
}

export default function ImageUploader({ recipeId }: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');

  const {
    images,
    isLoading,
    uploadImage,
    deleteImage,
    setPrimaryImage,
    fetchImages,
  } = useRecipeImages({
    recipeId,
    onSuccess: () => {
      setSelectedFile(null);
      setAltText('');
    },
    onError: (error) => {
      console.error('Error:', error);
      // You might want to add toast notification here
    },
  });

  // Fetch images on mount
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await uploadImage(selectedFile, altText);
  };

  return (
    <>
      {/* Upload Section */}
      <div className="mb-8 p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Upload New Image</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="image">Select Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="alt">Alt Text</Label>
            <Input
              id="alt"
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image"
              className="mt-1"
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload Image
          </Button>
        </div>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            className={`relative group border rounded-lg overflow-hidden ${
              image.isPrimary ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="aspect-video relative">
              <Image
                src={image.mediumUrl}
                alt={image.alt || ''}
                fill
                className="object-cover"
              />
            </div>

            {/* Thumbnail preview */}
            <div className="absolute bottom-2 left-2">
              <div className="w-12 h-12 relative">
                <Image
                  src={image.thumbnailUrl}
                  alt={image.alt || ''}
                  fill
                  className="object-cover rounded"
                />
              </div>
            </div>

            {/* Image Actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPrimaryImage(image.id)}
                disabled={image.isPrimary || isLoading}
              >
                Set as Primary
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteImage(image.id)}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Primary Badge */}
            {image.isPrimary && (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm">
                Primary
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {images.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          No images uploaded yet. Add your first image above.
        </div>
      )}
    </>
  );
} 