import { Metadata } from "next"
import { Suspense } from "react"
import { Search } from "lucide-react"
import { SearchForm } from "@/components/search/search-form"
import { SearchResults } from "@/components/search/search-results"

export const metadata: Metadata = {
  title: "Cari Resipi - ResepiCheNom",
  description: "Cari resipi kegemaran anda dari koleksi resipi kami.",
}

interface SearchPageProps {
  searchParams: {
    q?: string
    kategori?: string
  }
}

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg overflow-hidden shadow">
          <div className="aspect-video bg-gray-200 animate-pulse" />
          <div className="p-4 space-y-4">
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const { q: searchQuery = "", kategori } = searchParams

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Search className="w-8 h-8 text-orange-500" />
          Cari Resipi
        </h1>

        <SearchForm initialQuery={searchQuery} initialCategory={kategori} />

        {searchQuery && (
          <div className="mt-8">
            <Suspense fallback={<SearchSkeleton />}>
              <SearchResults query={searchQuery} category={kategori} />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  )
} 