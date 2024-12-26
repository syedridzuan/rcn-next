import { Suspense } from 'react';
import ImageUploader from './image-uploader.client';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';

interface RecipeImagesPageProps {
  params: {
    recipeId: string;
  };
}

async function getRecipe(recipeId: string) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { title: true }
  });

  if (!recipe) {
    notFound();
  }

  return recipe;
}

export default async function RecipeImagesPage({ params }: RecipeImagesPageProps) {
  const recipe = await getRecipe(params.recipeId);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Recipe Images</h1>
          <p className="text-gray-600 mt-1">
            {recipe.title}
          </p>
        </div>
        <Link
          href="/dashboard/recipes"
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
        >
          ← Kembali ke Senarai Resipi
        </Link>
      </div>
      
      <Suspense fallback={<div>Loading...</div>}>
        <ImageUploader recipeId={params.recipeId} />
      </Suspense>
    </div>
  );
} 