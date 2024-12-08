import Image from 'next/image'
import Link from 'next/link'
import { Clock, ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeroRecipeProps {
  recipe: {
    id: string
    title: string
    description: string | null
    image: string | null
    slug: string
    difficulty: string
    cookTime: number
    prepTime: number
    category: {
      name: string
    }
  }
}

export function HeroRecipe({ recipe }: HeroRecipeProps) {
  return (
    <div className="relative h-[600px] w-full">
      {/* Background Image */}
      {recipe.image && (
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover brightness-50"
          priority
        />
      )}
      
      {/* Content Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <div className="mb-4">
              <span className="text-sm uppercase tracking-wider bg-primary/80 px-3 py-1 rounded-full">
                Featured Recipe
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {recipe.title}
            </h1>
            
            {recipe.description && (
              <p className="text-lg text-gray-200 mb-6">
                {recipe.description}
              </p>
            )}
            
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{recipe.prepTime + recipe.cookTime} mins</span>
              </div>
              <div className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                <span>{recipe.difficulty}</span>
              </div>
              <div className="text-primary">
                {recipe.category.name}
              </div>
            </div>
            
            <Button asChild size="lg">
              <Link href={`/recipes/${recipe.slug}`}>
                Cook Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 