import { prisma } from '@/lib/db'
import TagsList from './tag-list'

export default async function TagsPage({ searchParams }: { searchParams: { success?: string; error?: string } }) {
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="container mx-auto p-8">
      <TagsList tags={tags} success={searchParams.success} error={searchParams.error} />
    </div>
  )
}
