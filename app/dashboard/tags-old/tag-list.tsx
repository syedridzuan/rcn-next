"use client"
import { deleteTagAction } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function DeleteTagButton({ tagId }: { tagId: string }) {
  const router = useRouter()
  
  async function handleDelete() {
    const formData = new FormData()
    formData.append('id', tagId)

    const result = await deleteTagAction(formData)
    if (result.success) {
      toast.success(result.message)
      router.refresh() // or router.push('/dashboard/tags') if needed
    } else {
      toast.error(result.message)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="bg-red-600 text-white px-4 py-2"
    >
      Delete
    </button>
  )
}
