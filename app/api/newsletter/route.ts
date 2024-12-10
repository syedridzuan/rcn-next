import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { randomBytes } from "crypto";
import { auth } from '@/lib/auth'
import crypto from 'crypto'

// Initialize AWS SES client
const ses = new SESClient({
  region: process.env.AWS_SES_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// GET route for fetching all subscribers
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscribers = await prisma.subscriber.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(subscribers)
  } catch (error) {
    console.error('Failed to fetch subscribers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    )
  }
}

// POST route for creating new subscribers
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Create subscriber with verification token
    const subscriber = await prisma.subscriber.create({
      data: {
        email: body.email,
        isVerified: body.isVerified ?? false,
        verificationToken: body.isVerified ? null : crypto.randomUUID(),
        verifiedAt: body.isVerified ? new Date() : null,
      },
    })

    // If not marked as verified, send verification email
    if (!body.isVerified) {
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/verify?token=${subscriber.verificationToken}`
      
      const command = new SendEmailCommand({
        Source: process.env.AWS_SES_FROM_EMAIL,
        Destination: {
          ToAddresses: [subscriber.email],
        },
        Message: {
          Subject: {
            Data: "Verify your newsletter subscription",
          },
          Body: {
            Html: {
              Data: `
                <h1>Verify your email</h1>
                <p>Click the link below to verify your newsletter subscription:</p>
                <a href="${verificationUrl}">Verify Email</a>
                <p>If you didn't request this, you can safely ignore this email.</p>
              `,
            },
          },
        },
      })

      await ses.send(command)
    }

    return NextResponse.json(subscriber)
  } catch (error) {
    console.error('Failed to create subscriber:', error)
    return NextResponse.json(
      { error: 'Failed to create subscriber' },
      { status: 500 }
    )
  }
} 