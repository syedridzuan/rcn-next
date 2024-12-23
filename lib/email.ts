// lib/email.ts
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"

/**
 * Send an email with a reset password link
 * @param email - The recipient’s email address
 * @param resetLink - The reset password URL
 */
export async function sendResetPasswordEmail(email: string, resetLink: string) {
  // Reuse the same AWS credentials & region from your environment variables
  const ses = new SESClient({
    region: process.env.AWS_SES_REGION_NAME!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    // If you want a custom endpoint (as seen in registerAction):
    endpoint: `https://${process.env.AWS_SES_REGION_ENDPOINT}`,
  })

  // Build your email message
  const command = new SendEmailCommand({
    Source: process.env.AWS_SES_FROM_EMAIL!,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: { Data: "Reset Kata Laluan Anda" },
      Body: {
        Html: {
          Data: `
            <h1>Reset Kata Laluan Anda</h1>
            <p>Anda telah meminta tetapan semula kata laluan. Sila klik pautan di bawah untuk menetapkan kata laluan baru:</p>
            <p><a href="${resetLink}" target="_blank" rel="noopener noreferrer">Set Semula Kata Laluan</a></p>
            <p>Jika anda tidak meminta ini, sila abaikan emel ini.</p>
          `,
        },
      },
    },
  })

  // Attempt to send
  try {
    await ses.send(command)
  } catch (error) {
    console.error("Failed to send reset password email:", error)
    throw new Error("Failed to send reset password email")
  }
}