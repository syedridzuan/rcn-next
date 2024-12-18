import { NextResponse } from 'next/server'
import { z } from 'zod'
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"

// Validate environment variables are set
if (!process.env.AWS_SES_REGION_NAME ||
    !process.env.AWS_SES_REGION_ENDPOINT ||
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY ||
    !process.env.DEFAULT_FROM_EMAIL) {
  throw new Error('SES environment variables not properly configured.')
}

const ses = new SESClient({
  region: process.env.AWS_SES_REGION_NAME,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  // Optional: If you want to specify a custom endpoint for SES
  endpoint: `https://${process.env.AWS_SES_REGION_ENDPOINT}`,
})

// Zod schema for validation
const ContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message cannot be empty"),
})

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const parsed = ContactSchema.safeParse(data)

    if (!parsed.success) {
      return NextResponse.json({
        error: "Validation error",
        details: parsed.error.errors
      }, { status: 400 })
    }

    const { name, email, message } = parsed.data

    const params = {
      Source: process.env.DEFAULT_FROM_EMAIL!,
      Destination: {
        ToAddresses: ["notification@resepichenom.com"],
      },
      Message: {
        Subject: {
          Data: "New Contact Form Submission",
        },
        Body: {
          Text: {
            Data: `You have received a new contact form submission.\n\nName: ${name}\nEmail: ${email}\nMessage:\n${message}`,
          },
        },
      },
    }

    const command = new SendEmailCommand(params)
    await ses.send(command)

    return NextResponse.json({ success: true, message: "Email sent successfully" })
  } catch (error) {
    console.error("Failed to send contact email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}