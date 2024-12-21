'use client';

import { useRecipeImages } from '@/hooks/use-recipe-images';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

interface ImageUploaderProps {
  recipeId: string;
}

export default function ImageUploader({ recipeId }: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [operationError, setOperationError] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    images,
    isLoading,
    error: fetchError,
    uploadImage,
    deleteImage,
    setPrimaryImage,
    fetchImages,
  } = useRecipeImages({
    recipeId,
    onSuccess: () => {
      setSelectedFile(null);
      setAltText('');
      setOperationError(null);
      fetchImages();
      toast({
        title: "Success",
        description: "Image operation completed successfully",
      });
    },
    onError: (error) => {
      console.error('Error:', error);
      setOperationError(error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred",
      });
    },
  });

  useEffect(() => {
    fetchImages().catch((error) => {
      console.error('Failed to fetch images:', error);
      setOperationError(error.message);
    });
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setOperationError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      setOperationError(null);
      await uploadImage(selectedFile, altText);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload image';
      setOperationError(message);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: message,
      });
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      setOperationError(null);
      await deleteImage(imageId);
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete image';
      setOperationError(message);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: message,
      });
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      setOperationError(null);
      await setPrimaryImage(imageId);
      toast({
        title: "Success",
        description: "Primary image set successfully",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to set primary image';
      setOperationError(message);
      toast({
        variant: "destructive",
        title: "Operation Failed",
        description: message,
      });
    }
  };

  const renderImageGrid = () => {
    if (isLoading && !images.length) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (!images.length) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          No images uploaded yet. Add your first image above.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div
            key={`image-${image.id}`}
            className={`relative group border rounded-lg overflow-hidden ${
              image.isPrimary ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="aspect-video relative">
              <Image
                src={image.url}
                alt={image.alt || ''}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {!image.isPrimary && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSetPrimary(image.id)}
                  disabled={isLoading}
                >
                  Set as Primary
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(image.id)}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {image.isPrimary && (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm">
                Primary
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (fetchError || operationError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {operationError || (fetchError && fetchError.message) || 'An error occurred while loading images'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
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

      {renderImageGrid()}
    </>
  );
} 