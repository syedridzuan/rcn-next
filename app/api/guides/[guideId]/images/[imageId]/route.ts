import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { unlink } from 'fs/promises'
import path from 'path'

export async function DELETE(
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

    const image = await prisma.guideImage.delete({
      where: {
        id: params.imageId,
        guideId: params.guideId,
      },
    })

    // Delete file from local storage
    try {
      const filePath = path.join(process.cwd(), 'public', image.url)
      await unlink(filePath)
    } catch (error) {
      console.error('Failed to delete file:', error)
      // Continue even if file deletion fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete image:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
} 