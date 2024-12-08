'use client'

import { useRouter } from 'next/navigation'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CategoryFiltersProps {
  initialSort?: string
  initialDifficulty?: string
}

export function CategoryFilters({ initialSort, initialDifficulty }: CategoryFiltersProps) {
  const router = useRouter()

  const updateSearchParams = (key: string, value: string) => {
    const url = new URL(window.location.href)
    if (value && value !== 'all') {
      url.searchParams.set(key, value)
    } else {
      url.searchParams.delete(key)
    }
    router.push(url.toString())
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <Select
        defaultValue={initialSort || 'newest'}
        onValueChange={(value) => updateSearchParams('sort', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="cookTime">Cooking Time</SelectItem>
          <SelectItem value="title">Alphabetical</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={initialDifficulty || 'all'}
        onValueChange={(value) => updateSearchParams('difficulty', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Difficulties</SelectItem>
          <SelectItem value="EASY">Easy</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="HARD">Hard</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
} 