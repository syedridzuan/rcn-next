// lib/email.ts
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

/**
 * Send a generic email.
 * For example: when you want to send a notification or new comment alert.
 *
 * @param to      - Recipient’s email address
 * @param subject - Email subject
 * @param html    - HTML body content
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // Configure SES with your environment variables
  const ses = new SESClient({
    region: process.env.AWS_SES_REGION_NAME!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    // Optionally specify a custom endpoint if you have it in your env:
    endpoint: process.env.AWS_SES_REGION_ENDPOINT
      ? `https://${process.env.AWS_SES_REGION_ENDPOINT}`
      : undefined,
  });

  const command = new SendEmailCommand({
    Source: process.env.AWS_SES_FROM_EMAIL!, // “from” address from your env
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
      },
      Body: {
        Html: {
          Data: html,
        },
      },
    },
  });

  try {
    await ses.send(command);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email");
  }
}

/**
 * Send an email with a reset password link (example usage).
 *
 * @param email     - The recipient’s email address
 * @param resetLink - The reset password URL
 */
export async function sendResetPasswordEmail(email: string, resetLink: string) {
  const subject = "Reset Kata Laluan Anda";
  const html = `
    <h1>Reset Kata Laluan Anda</h1>
    <p>Anda telah meminta tetapan semula kata laluan. Sila klik pautan di bawah untuk menetapkan kata laluan baru:</p>
    <p><a href="${resetLink}" target="_blank" rel="noopener noreferrer">Set Semula Kata Laluan</a></p>
    <p>Jika anda tidak meminta ini, sila abaikan emel ini.</p>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
}
