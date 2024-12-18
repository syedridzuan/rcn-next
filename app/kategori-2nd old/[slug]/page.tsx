export const runtime = 'nodejs'

import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const AVAILABLE_TAGS = ['pedas', 'manis', 'ringkas']
const PER_PAGE_OPTIONS = [10, 20, 50]

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string; per_page?: string; tags?: string }>
}

// Generate SEO metadata using awaited params
export async function generateMetadata(context: CategoryPageProps) {
  const awaitedParams = await context.params
  const awaitedSearchParams = await context.searchParams
  const { slug } = awaitedParams
  const { page: pageParam } = awaitedSearchParams

  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category) return {}

  const page = parseInt(pageParam || '1', 10)
  const titleBase = `Resipi dalam Kategori: ${category.name} | Nama Laman`
  const title = page > 1 ? `${category.name} - Halaman ${page}` : titleBase

  return {
    title,
    description: `Cari resipi dalam kategori ${category.name}. Gunakan penapis bahasa dan tag untuk hasil yang lebih tepat.`
  }
}

export default async function CategoryPage(context: CategoryPageProps) {
  const awaitedParams = await context.params
  const awaitedSearchParams = await context.searchParams
  const { slug } = awaitedParams
  const { page: pageParam, per_page, tags } = awaitedSearchParams

  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category) {
    notFound()
  }

  const page = parseInt(pageParam || '1', 10)
  const perPage = PER_PAGE_OPTIONS.includes(parseInt(per_page || '10', 10))
    ? parseInt(per_page || '10', 10)
    : 10
  const offset = (page - 1) * perPage

  const tagFilter = tags ? tags.split(',') : []

  const whereClause: any = { 
    categoryId: category.id,
    language: 'ms'
  }

  if (tagFilter.length > 0) {
    whereClause.tags = {
      some: {
        name: { in: tagFilter }
      }
    }
  }

  const [recipes, totalCount] = await Promise.all([
    prisma.recipe.findMany({
      where: whereClause,
      orderBy: { title: 'asc' },
      skip: offset,
      take: perPage,
      include: {
        tags: true
      }
    }),
    prisma.recipe.count({ where: whereClause })
  ])

  const totalPages = Math.ceil(totalCount / perPage)

  function buildUrl(overrides: Record<string, string | undefined>) {
    const sp = new URLSearchParams(awaitedSearchParams as any)
    for (const key of Object.keys(overrides)) {
      if (overrides[key] == null) {
        sp.delete(key)
      } else {
        sp.set(key, overrides[key]!)
      }
    }
    return `/kategori/${slug}?${sp.toString()}`
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Kategori: {category.name}</h1>

      <form className="space-y-4" action="#" method="get">
        <input type="hidden" name="page" value="1" />

        {/* Tag Filter */}
        <div>
          <Label className="font-semibold mb-1 block">Tag Pilihan:</Label>
          <select
            name="tags"
            multiple
            className="border px-2 py-1 rounded w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue={tagFilter}
          >
            {AVAILABLE_TAGS.map(tag => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-600">Tahan CTRL/CMD untuk pilih berbilang tag.</p>
        </div>

        {/* Per Page Filter */}
        <div>
          <Label className="font-semibold mb-1 block">Papar per halaman:</Label>
          <select
            name="per_page"
            className="border px-2 py-1 rounded w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue={String(perPage)}
          >
            {PER_PAGE_OPTIONS.map(opt => (
              <option key={opt} value={String(opt)}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" variant="default" className="bg-blue-600 text-white">
          Tapis
        </Button>
      </form>

      {recipes.length === 0 && (
        <p className="text-gray-600">Tiada resipi dalam kategori ini.</p>
      )}

      {recipes.length > 0 && (
        <ul className="space-y-4">
          {recipes.map(recipe => (
            <li key={recipe.id} className="border rounded p-4">
              <h2 className="font-semibold">{recipe.title}</h2>
              {recipe.tags.length > 0 && (
                <p className="text-sm text-gray-700">
                  Tag: {recipe.tags.map(t => t.name).join(', ')}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-2 mt-4">
          {page > 1 && (
            <Button asChild variant="outline">
              <a href={buildUrl({ page: String(page - 1) })}>Sebelumnya</a>
            </Button>
          )}
          <span>Halaman {page} daripada {totalPages}</span>
          {page < totalPages && (
            <Button asChild variant="outline">
              <a href={buildUrl({ page: String(page + 1) })}>Seterusnya</a>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
