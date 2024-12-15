import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface RecipeSectionsProps {
  sections: {
    id: string
    title: string
    type: string
    items: {
      id: string
      content: string
    }[]
  }[]
  labels: {
    ingredients: string
    instructions: string
  }
}

export function RecipeSections({ sections, labels }: RecipeSectionsProps) {
  // Separate sections by type
  const ingredientSections = sections.filter(section => section.type === 'INGREDIENTS')
  const instructionSections = sections.filter(section => section.type === 'INSTRUCTIONS')

  return (
    <div className="space-y-6">
      {/* Ingredients */}
      {ingredientSections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{labels.ingredients}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {ingredientSections.map((section, index) => (
              <div key={section.id}>
                {index > 0 && <Separator className="my-4" />}
                {section.title && (
                  <h4 className="font-medium text-lg mb-3">{section.title}</h4>
                )}
                <ul className="space-y-2">
                  {section.items.map(item => (
                    <li key={item.id} className="flex items-start gap-2">
                      <span className="w-2 h-2 mt-2 rounded-full bg-primary" />
                      <span>{item.content}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {instructionSections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{labels.instructions}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {instructionSections.map((section, index) => (
              <div key={section.id}>
                {index > 0 && <Separator className="my-4" />}
                {section.title && (
                  <h4 className="font-medium text-lg mb-3">{section.title}</h4>
                )}
                <ol className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <li key={item.id} className="flex items-start gap-4">
                      <span className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
                        {itemIndex + 1}
                      </span>
                      <span className="flex-1 pt-1">{item.content}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

