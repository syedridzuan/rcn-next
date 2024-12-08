import { useState } from 'react';

interface RecipeImage {
  id: string;
  url: string;
  mediumUrl: string;
  thumbnailUrl: string;
  alt?: string;
  isPrimary: boolean;
}

interface UseRecipeImagesProps {
  recipeId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useRecipeImages({ recipeId, onSuccess, onError }: UseRecipeImagesProps) {
  const [images, setImages] = useState<RecipeImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/recipes/${recipeId}/images`);
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setImages(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch images');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File, alt: string) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('alt', alt);

      const response = await fetch(`/api/recipes/${recipeId}/images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload image');
      }

      await fetchImages();
      onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to upload image');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/recipes/${recipeId}/images?imageId=${imageId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete image');
      }

      await fetchImages();
      onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete image');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const setPrimaryImage = async (imageId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/recipes/${recipeId}/images?imageId=${imageId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'setPrimary' }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to set primary image');
      }

      await fetchImages();
      onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to set primary image');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    images,
    isLoading,
    error,
    fetchImages,
    uploadImage,
    deleteImage,
    setPrimaryImage,
  };
} 