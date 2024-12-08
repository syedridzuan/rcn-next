'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useState } from 'react'

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [cookTime, setCookTime] = useState<number>(120)

  const updateSearch = (key: string, value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    
    if (value) {
      current.set(key, value)
    } else {
      current.delete(key)
    }
    
    const search = current.toString()
    const query = search ? `?${search}` : ''
    
    router.push(`/search${query}`)
  }

  return (
    <Card className="p-4 space-y-6">
      <div className="space-y-2">
        <Label>Difficulty</Label>
        <Select
          defaultValue={searchParams.get('difficulty') || ''}
          onValueChange={(value) => updateSearch('difficulty', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Language</Label>
        <Select
          defaultValue={searchParams.get('language') || ''}
          onValueChange={(value) => updateSearch('language', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="ms">Malay</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label>Maximum Cook Time: {cookTime} minutes</Label>
        <Slider
          defaultValue={[parseInt(searchParams.get('maxCookTime') || '120')]}
          max={240}
          step={15}
          onValueChange={(value) => {
            setCookTime(value[0])
            updateSearch('maxCookTime', value[0].toString())
          }}
        />
      </div>
    </Card>
  )
}
