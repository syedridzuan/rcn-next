'use client'

import { useEffect, useState } from 'react'
import { Dropdown } from "@/components/Dropdown"
import { getCategories } from './category-nav'

export function CategoryDropdown() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (isLoading) {
    return <div className="h-10 w-24 bg-gray-100 animate-pulse rounded"></div>
  }

  return (
    <Dropdown
      title="Kategori"
      items={categories}
    />
  )
} 