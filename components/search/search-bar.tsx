'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { SearchIcon } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { Command, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface SearchSuggestion {
  id: string
  title: string
  slug: string
}

export function SearchBar() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const debouncedValue = useDebounce(inputValue, 300)

  useEffect(() => {
    if (debouncedValue.length > 1) {
      fetch(`/api/search/suggestions?q=${encodeURIComponent(debouncedValue)}`)
        .then(res => res.json())
        .then(data => setSuggestions(data))
    } else {
      setSuggestions([])
    }
  }, [debouncedValue])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue) {
      router.push(`/search?q=${encodeURIComponent(inputValue)}`)
      setOpen(false)
    }
  }

  return (
    <div className="relative w-full max-w-lg">
      <form onSubmit={handleSubmit}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search recipes..."
                className="pl-10"
              />
            </div>
          </PopoverTrigger>
          {suggestions.length > 0 && (
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandEmpty>No recipes found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion.id}
                      onSelect={() => {
                        router.push(`/recipes/${suggestion.slug}`)
                        setOpen(false)
                      }}
                    >
                      {suggestion.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          )}
        </Popover>
      </form>
    </div>
  )
} 