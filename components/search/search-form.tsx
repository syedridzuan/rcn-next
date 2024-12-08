'use client'

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getCategories } from "../categories/category-nav"

interface SearchFormProps {
  initialQuery?: string
  initialCategory?: string | null
}

export function SearchForm({ initialQuery = "", initialCategory = null }: SearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState<string | null>(initialCategory)
  const [categories, setCategories] = useState<{ label: string; href: string }[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }

    fetchCategories()
  }, [])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (category) params.set("kategori", category)
    router.push(`/cari?${params.toString()}`)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Cari resipi..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
          <Search className="w-4 h-4" />
          <span className="ml-2">Cari</span>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Select 
          value={category || undefined} 
          onValueChange={(value) => setCategory(value || null)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((category) => (
              <SelectItem 
                key={category.href} 
                value={category.href.split('/').pop() || 'default'}
              >
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </form>
  )
} 