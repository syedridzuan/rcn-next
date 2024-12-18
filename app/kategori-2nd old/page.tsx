import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Senarai Kategori | Resepi Kita',
  description: 'Temui pelbagai kategori resepi yang menarik untuk dicuba.'
}

export const runtime = 'nodejs'

export default async function KategoriPage() {
  const kategori = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { recipes: true }
      }
    }
  })

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Senarai Kategori</h1>

      {kategori.length === 0 ? (
        <p className="text-gray-600">Tiada kategori ditemui.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kategori.map((kat) => (
            <Link
              key={kat.id}
              href={`/kategori/${kat.slug}`}
              className="block p-6 rounded-lg border hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{kat.name}</h2>
              {kat.description && (
                <p className="text-gray-600 mb-2">{kat.description}</p>
              )}
              <p className="text-sm text-gray-500">
                {kat._count.recipes} resipi
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
