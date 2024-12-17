import { prisma } from '@/lib/db'
import { updateTag } from '../../actions'
import { notFound, redirect } from 'next/navigation'

interface EditTagPageProps {
  params: { id: string }
}

export default async function EditTagPage({ params }: EditTagPageProps) {
  const tag = await prisma.tag.findUnique({ where: { id: params.id } })
  if (!tag) {
    notFound()
  }

  async function handleUpdateTag(formData: FormData) {
    const name = formData.get('name') as string
    if (!name) {
      throw new Error('Name is required')
    }
    await updateTag(params.id, name)
    redirect('/dashboard/tags')
  }

  return (
    <form action={handleUpdateTag} className="max-w-md mx-auto p-8 space-y-4">
      <h2 className="text-xl font-bold">Edit Tag</h2>
      <input
        type="text"
        name="name"
        defaultValue={tag.name}
        className="border w-full px-3 py-2"
      />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => history.back()} className="border px-4 py-2">
          Cancel
        </button>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2">
          Update
        </button>
      </div>
    </form>
  )
}
