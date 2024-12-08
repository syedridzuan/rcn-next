import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon } from 'lucide-react';
import { prisma } from '@/lib/prisma';

interface PageProps {
  params: Promise<{
    recipeId: string;
  }>;
}

async function getRecipeWithPrimaryImage(recipeId: string) {
  return prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
    },
  });
}

export default async function RecipePage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const recipe = await getRecipeWithPrimaryImage(resolvedParams.recipeId);
  const primaryImage = recipe?.images[0];

  // Debug log
  console.log('Recipe:', recipe);
  console.log('Primary Image:', primaryImage);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{recipe?.title || 'Recipe'}</h1>
        <Link href={`/recipes/${resolvedParams.recipeId}/images`}>
          <Button variant="outline">
            <ImageIcon className="mr-2 h-4 w-4" />
            Manage Images
          </Button>
        </Link>
      </div>

      {/* Primary Image */}
      <div className="mb-8">
        {primaryImage ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
            <img
              src={primaryImage.url}
              alt={primaryImage.alt || recipe?.title || 'Recipe image'}
              className="object-cover w-full h-full"
            />
          </div>
        ) : (
          <div className="relative aspect-video w-full rounded-lg border bg-muted flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Recipe Content */}
      <div className="prose max-w-none">
        {recipe?.description && (
          <p className="text-muted-foreground">{recipe.description}</p>
        )}
      </div>
    </div>
  );
} 