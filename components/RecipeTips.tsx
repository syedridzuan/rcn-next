import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { LightbulbIcon } from 'lucide-react'

interface Tip {
  id: string
  content: string
}

interface RecipeTipsProps {
  tips: Tip[]
}

export function RecipeTips({ tips }: RecipeTipsProps) {
  if (!tips || tips.length === 0) return null

  return (
    <Card className="bg-orange-50 border-orange-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-orange-600 flex items-center gap-2">
          <LightbulbIcon className="h-6 w-6" />
          Petua & Panduan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {tips.map((tip) => (
            <li key={tip.id} className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm">
              <span className="text-orange-500 font-bold text-lg">•</span>
              <span className="text-gray-700 leading-relaxed">{tip.content}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

