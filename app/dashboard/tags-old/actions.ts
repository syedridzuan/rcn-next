'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function createTagAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'Not authenticated' }
  }

  const name = formData.get('name') as string | null
  if (!name) {
    return { success: false, message: 'Name is required' }
  }

  try {
    await prisma.tag.create({ data: { name } })
    // No redirect here, just return a success result
    return { success: true, message: 'Tag created successfully' }
  } catch (e) {
    return { success: false, message: 'Failed to create tag' }
  }
}

export async function deleteTagAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'Not authenticated' }
  }

  const id = formData.get('id') as string | null
  if (!id) {
    return { success: false, message: 'Tag ID is required' }
  }

  try {
    await prisma.tag.delete({ where: { id } })
    return { success: true, message: 'Tag deleted successfully' }
  } catch (e) {
    return { success: false, message: 'Failed to delete tag' }
  }
}
