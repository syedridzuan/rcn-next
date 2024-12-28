import { Clock, Users } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"

interface RecipeMetaCardsProps {
  prepTime: number
  cookTime: number
  totalTime?: number
  servings: number
  labels: {
    prepTime: string
    cookTime: string
    totalTime: string
    servings: string
    minutes: string
    people: string
  }
}

// Utility function to format time
function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minit`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours} jam`
  }
  
  return `${hours} jam ${remainingMinutes} minit`
}

export function RecipeMetaCards({
  prepTime,
  cookTime,
  totalTime,
  servings,
  labels,
}: RecipeMetaCardsProps) {
  // Calculate total time if not provided
  const calculatedTotalTime = totalTime || (prepTime + cookTime)

  return (
    <>
      <Card className="recipe-card">
        <CardContent className="flex items-center gap-3 p-4">
          <Clock className="w-8 h-8 text-orange-500" />
          <div>
            <p className="text-sm text-gray-500">{labels.prepTime}</p>
            <p className="font-semibold">
              {prepTime} {labels.minutes}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="recipe-card">
        <CardContent className="flex items-center gap-3 p-4">
          <Clock className="w-8 h-8 text-orange-500" />
          <div>
            <p className="text-sm text-gray-500">{labels.cookTime}</p>
            <p className="font-semibold">
              {cookTime} {labels.minutes}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="recipe-card">
        <CardContent className="flex items-center gap-3 p-4">
          <Clock className="w-8 h-8 text-orange-500" />
          <div>
            <p className="text-sm text-gray-500">{labels.totalTime}</p>
            <p className="font-semibold">
              {formatTime(calculatedTotalTime)}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="recipe-card">
        <CardContent className="flex items-center gap-3 p-4">
          <Users className="w-8 h-8 text-orange-500" />
          <div>
            <p className="text-sm text-gray-500">{labels.servings}</p>
            <p className="font-semibold">
              {servings} {labels.people}
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

