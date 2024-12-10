import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendNewsletter, sendTestEmail } from '@/lib/ses'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subject, content, isTest, testEmail } = body

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      )
    }

    if (isTest) {
      if (!testEmail) {
        return NextResponse.json(
          { error: 'Test email address is required' },
          { status: 400 }
        )
      }

      await sendTestEmail(testEmail, subject, content)
      return NextResponse.json({ success: true })
    }

    // Get all verified subscribers
    const subscribers = await prisma.subscriber.findMany({
      where: {
        isVerified: true,
      },
      select: {
        email: true,
      },
    })

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No verified subscribers found' },
        { status: 400 }
      )
    }

    await sendNewsletter(subscribers, subject, content)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Campaign error:', error)
    return NextResponse.json(
      { error: 'Failed to send campaign' },
      { status: 500 }
    )
  }
} 