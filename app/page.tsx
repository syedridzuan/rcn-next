import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/db'

async function getRecipes() {
  return await prisma.recipe.findMany({
    take: 10,
    include: {
      category: true,
      user: {
        select: {
          name: true,
        },
      },
      images: {
        where: {
          isPrimary: true
        }
      },
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export default async function HomePage() {
  const recipes = await getRecipes();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Latest Recipes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <Link 
            key={recipe.id} 
            href={`/resepi/${recipe.slug}`}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {recipe.images[0] && (
              <div className="aspect-video relative">
                <Image
                  src={recipe.images[0].mediumUrl}
                  alt={recipe.images[0].alt || recipe.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="p-4">
              <h2 className="font-semibold text-lg mb-2">{recipe.title}</h2>
              <p className="text-gray-600 text-sm mb-2">{recipe.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{recipe.category.name}</span>
                <span>{recipe.cookTime + recipe.prepTime} mins</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
