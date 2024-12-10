import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { guideId: string; imageId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await prisma.$transaction([
      // Reset all images to non-primary
      prisma.guideImage.updateMany({
        where: { guideId: params.guideId },
        data: { isPrimary: false },
      }),
      // Set the selected image as primary
      prisma.guideImage.update({
        where: {
          id: params.imageId,
          guideId: params.guideId,
        },
        data: { isPrimary: true },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update primary image:', error)
    return NextResponse.json(
      { error: 'Failed to update primary image' },
      { status: 500 }
    )
  }
} 