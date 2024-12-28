import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export const runtime = 'nodejs'

export default async function KategoriPage() {
  const kategori = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    // Assume `description`, `imageUrl`, and `recipesCount` fields or a way to get them
    // If `recipesCount` not stored, you might do a .map after fetching to count recipes via prisma.recipe.count()
    // For simplicity, assume category has `recipesCount` field or we fetch it similarly.
  })

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Senarai Kategori Resipi</h1>
      <p className="text-gray-700">
        Di bawah ialah senarai kategori resipi yang tersedia. Sila pilih kategori untuk menerokai resipi mengikut citarasa anda.
      </p>

      {kategori.length === 0 && (
        <p className="text-gray-600">Tiada kategori ditemui.</p>
      )}

      {kategori.length > 0 && (
        <ul className="space-y-4">
          {kategori.map((kat) => (
            <li key={kat.id} className="border rounded p-4 flex items-center gap-4">
              <Avatar className="w-16 h-16">
                {kat.image ? (
                  <AvatarImage src={kat.image} alt={`Ikon untuk ${kat.name}`} />
                ) : (
                  <AvatarFallback>{kat.name.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <Link href={`/kategori/${kat.slug}`}>
                  <h2 className="text-lg font-semibold text-blue-600 hover:underline">{kat.name}</h2>
                </Link>
                <p className="text-sm text-gray-700">
                  {kat.description || 'Kategori ini mengandungi pelbagai resipi.'}
                </p>
                <p className="text-sm text-gray-700 mt-1">{kat.recipesCount || 0} resipi</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
