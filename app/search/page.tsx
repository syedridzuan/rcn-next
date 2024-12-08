import { Suspense } from 'react'
import { SearchFilters } from '@/components/search/search-filters'
import { SearchResults } from '@/components/search/search-results'
import { SearchBar } from '@/components/search/search-bar'

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search Recipes</h1>
        <SearchBar />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1">
          <SearchFilters />
        </aside>
        
        <main className="md:col-span-3">
          <Suspense fallback={<div>Loading...</div>}>
            <SearchResults searchParams={searchParams} />
          </Suspense>
        </main>
      </div>
    </div>
  )
} 