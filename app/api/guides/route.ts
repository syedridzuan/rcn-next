import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, content } = body

    const guide = await prisma.guide.create({
      data: {
        title,
        slug,
        content,
        authorId: session.user.id,
      },
    })

    return NextResponse.json(guide)
  } catch (error) {
    console.error('Failed to create guide:', error)
    return NextResponse.json(
      { error: 'Failed to create guide' },
      { status: 500 }
    )
  }
}
