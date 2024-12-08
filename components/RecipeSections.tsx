import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Utensils, List } from 'lucide-react'

interface RecipeItem {
  id: string
  content: string
}

interface RecipeSection {
  id: string
  title: string
  type: string
  items: RecipeItem[]
}

interface RecipeSectionsProps {
  sections: RecipeSection[]
  labels?: {
    ingredients: string
    instructions: string
  }
}

export function RecipeSections({
  sections,
  labels = {
    ingredients: "Bahan-bahan",
    instructions: "Cara Memasak",
  },
}: RecipeSectionsProps) {
  const ingredientSections = sections.filter(
    (section) => section.type === "INGREDIENTS"
  )
  const instructionSections = sections.filter(
    (section) => section.type === "INSTRUCTIONS"
  )

  return (
    <div className="space-y-8">
      {/* Ingredients Card */}
      <section>
        <Card className="border-orange-200">
          <CardHeader className="bg-orange-50 border-b border-orange-200">
            <CardTitle className="flex items-center gap-2 text-2xl text-orange-600">
              <List className="h-6 w-6" />
              {labels.ingredients}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {ingredientSections.map((section) => (
              <div key={section.id} className="mb-6 last:mb-0">
                {section.title && (
                  <h3 className="font-medium text-lg mb-3 text-orange-700">{section.title}</h3>
                )}
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-2 text-gray-700">
                      <span className="text-orange-500 font-bold">•</span>
                      {item.content}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Instructions Card */}
      <section>
        <Card className="border-orange-200">
          <CardHeader className="bg-orange-50 border-b border-orange-200">
            <CardTitle className="flex items-center gap-2 text-2xl text-orange-600">
              <Utensils className="h-6 w-6" />
              {labels.instructions}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ol className="space-y-6">
              {instructionSections[0]?.items.map((item, index) => (
                <li key={item.id} className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 mt-1">{item.content}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

