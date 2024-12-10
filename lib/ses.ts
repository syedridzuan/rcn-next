import { SESClient, SendEmailCommand, SendBulkTemplatedEmailCommand } from "@aws-sdk/client-ses"

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error('AWS credentials are not set')
}

const ses = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

export async function sendNewsletter(subscribers: { email: string }[], subject: string, content: string) {
  try {
    const command = new SendBulkTemplatedEmailCommand({
      Source: process.env.SES_FROM_EMAIL,
      Template: "NewsletterTemplate",
      Destinations: subscribers.map(subscriber => ({
        Destination: {
          ToAddresses: [subscriber.email],
        },
        ReplacementTemplateData: JSON.stringify({
          subject,
          content,
        }),
      })),
      DefaultTemplateData: JSON.stringify({
        subject,
        content,
      }),
    })

    const response = await ses.send(command)
    return response
  } catch (error) {
    console.error('SES error:', error)
    throw error
  }
}

// For testing single email
export async function sendTestEmail(email: string, subject: string, content: string) {
  try {
    const command = new SendEmailCommand({
      Source: process.env.SES_FROM_EMAIL,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: subject,
        },
        Body: {
          Html: {
            Data: content,
          },
        },
      },
    })

    const response = await ses.send(command)
    return response
  } catch (error) {
    console.error('SES error:', error)
    throw error
  }
} 