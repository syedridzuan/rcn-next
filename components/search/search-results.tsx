import Image from "next/image"
import Link from "next/link"
import { Clock, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { searchRecipes } from "@/app/actions/search"

interface SearchResultsProps {
  query: string
  category?: string | null
}

export async function SearchResults({ query, category }: SearchResultsProps) {
  const recipes = await searchRecipes(query, category)

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          Tiada resipi dijumpai untuk "{query}"{category && category !== 'all' ? ` dalam kategori ${category}` : ''}.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {recipes.map((recipe) => (
        <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <Link href={`/resepi/${recipe.slug}`}>
            <div className="aspect-video relative">
              {recipe.image ? (
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">Tiada gambar</span>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                  {recipe.category.name}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{recipe.prepTime + recipe.cookTime} min</span>
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-2 text-gray-900 line-clamp-2">
                {recipe.title}
              </h2>
              
              {recipe.description && (
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {recipe.description}
                </p>
              )}

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
                <span className="text-sm text-gray-600">
                  {recipe.user.name}
                </span>
              </div>
            </div>
          </Link>
        </Card>
      ))}
    </div>
  )
} 