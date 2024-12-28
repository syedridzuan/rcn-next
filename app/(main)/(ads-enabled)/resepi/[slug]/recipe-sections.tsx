import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
        <Card>
          <CardHeader>
            <CardTitle>{labels.ingredients}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {ingredientSections.map((section) => (
              <div key={section.id}>
                {section.title && (
                  <h3 className="font-medium text-lg mb-3">{section.title}</h3>
                )}
                <ul className="list-disc pl-6 space-y-2">
                  {section.items.map((item) => (
                    <li key={item.id} className="text-gray-700">{item.content}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Instructions Card */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>{labels.instructions}</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-6 space-y-4">
              {instructionSections[0]?.items.map((item) => (
                <li key={item.id} className="pl-2 text-gray-700">
                  <p>{item.content}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>
    </div>
  )
} 