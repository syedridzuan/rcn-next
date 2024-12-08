import Image from 'next/image'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock } from 'lucide-react'

interface Recipe {
  id: string
  title: string
  slug: string
  image: string | null
  cookTime: number
  prepTime: number
  difficulty: string
  user: {
    name: string | null
    image: string | null
  }
}

interface RecipeCollectionsProps {
  recent: Recipe[]
  quick: Recipe[]
}

export function RecipeCollections({ recent, quick }: RecipeCollectionsProps) {
  return (
    <Tabs defaultValue="recent" className="w-full">
      <TabsList className="mb-8">
        <TabsTrigger value="recent">Recent Recipes</TabsTrigger>
        <TabsTrigger value="quick">Quick & Easy</TabsTrigger>
      </TabsList>
      
      <TabsContent value="recent">
        <RecipeGrid recipes={recent} />
      </TabsContent>
      
      <TabsContent value="quick">
        <RecipeGrid recipes={quick} />
      </TabsContent>
    </Tabs>
  )
}

function RecipeGrid({ recipes }: { recipes: Recipe[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <Link
          key={recipe.id}
          href={`/resepi/${recipe.slug}`}
          className="group hover:shadow-lg transition-shadow duration-200 rounded-lg overflow-hidden border border-gray-200"
        >
          <div className="aspect-video relative">
            {recipe.image ? (
              <Image
                src={recipe.image}
                alt={recipe.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary">
              {recipe.title}
            </h3>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{recipe.prepTime + recipe.cookTime} mins</span>
              </div>
              
              <div className="flex items-center gap-2">
                {recipe.user.image && (
                  <Image
                    src={recipe.user.image}
                    alt={recipe.user.name || ''}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                )}
                <span>{recipe.user.name}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
} 