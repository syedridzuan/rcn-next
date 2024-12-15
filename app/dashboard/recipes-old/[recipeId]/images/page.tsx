import { Suspense, use } from 'react';
import ImageUploader from './image-uploader.client';

interface RecipeImagesPageProps {
  params: Promise<{
    recipeId: string;
  }>;
}

export default function RecipeImagesPage({ params }: RecipeImagesPageProps) {
  const resolvedParams = use(params);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Recipe Images</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ImageUploader recipeId={resolvedParams.recipeId} />
      </Suspense>
    </div>
  );
} 