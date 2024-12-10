import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { guideId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, content } = body

    const guide = await prisma.guide.update({
      where: { id: params.guideId },
      data: {
        title,
        slug,
        content,
      },
    })

    return NextResponse.json(guide)
  } catch (error) {
    console.error('Failed to update guide:', error)
    return NextResponse.json(
      { error: 'Failed to update guide' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { guideId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.guide.delete({
      where: { id: params.guideId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete guide:', error)
    return NextResponse.json(
      { error: 'Failed to delete guide' },
      { status: 500 }
    )
  }
} 