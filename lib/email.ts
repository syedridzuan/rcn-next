// lib/email.ts
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

/**
 * Re-usable function to send any generic HTML email.
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
  console.log("=== sendEmail DEBUG START ===");
  console.log("Attempting to send email with the following parameters:");
  console.log("  to:", to);
  console.log("  subject:", subject);
  console.log("  region:", process.env.AWS_SES_REGION_NAME);
  console.log("  fromEmail:", process.env.AWS_SES_FROM_EMAIL);

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
    Source: process.env.AWS_SES_FROM_EMAIL!, // “from” address from your .env
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

  console.log("SendEmailCommand created. Sending now...");

  try {
    await ses.send(command);
    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email");
  } finally {
    console.log("=== sendEmail DEBUG END ===\n");
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

  console.log("Calling sendResetPasswordEmail for:", email);

  await sendEmail({
    to: email,
    subject,
    html,
  });
}

/**
 * Send a “Set Password” email to new users so they can complete account creation.
 *
 * @param email - The recipient’s email address
 * @param token - A one-time token (VerificationToken) to embed in the link
 */
export async function sendSetPasswordEmail(email: string, token: string) {
  console.log("Calling sendSetPasswordEmail for:", email, "with token:", token);

  const subject = "Tetapkan Kata Laluan Akaun Anda";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const setPasswordUrl = `${baseUrl}/auth/create-password?token=${token}`;

  const html = `
    <h1>Selamat Datang!</h1>
    <p>Terima kasih kerana melanggan. Klik pautan di bawah untuk menetapkan kata laluan anda:</p>
    <p><a href="${setPasswordUrl}" target="_blank" rel="noopener noreferrer">Tetapkan Kata Laluan</a></p>
    <p>Jika anda tidak memulakan langganan ini, sila abaikan e-mel ini.</p>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
}

/**
 * Sends a simple payment confirmation email after a successful subscription purchase.
 *
 * @param email - The recipient’s email address
 */
export async function sendPaymentConfirmationEmail(email: string) {
  console.log("Calling sendPaymentConfirmationEmail for:", email);

  const subject = "Terima kasih atas langganan anda!";
  const html = `
    <h1>Terima Kasih!</h1>
    <p>Langganan anda telah disahkan dan pembayaran anda berjaya.</p>
    <p>Kami amat menghargai sokongan anda. Jika anda mempunyai sebarang pertanyaan, sila hubungi kami.</p>
    <p>Selamat menikmati akses penuh!</p>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
}

export async function sendReSubSuccessEmail(email: string) {
  console.log("Calling sendReSubSuccessEmail for:", email);

  const subject = "Langganan Anda Telah Aktif Semula!";
  const html = `
    <h1>Langganan Diperbaharui</h1>
    <p>Terima kasih! Langganan anda kini aktif semula.</p>
    <p>Anda kini boleh menikmati semula semua kelebihan pelan anda.</p>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
}

export async function sendReSubInitiatedEmail(email: string) {
  console.log("Calling sendReSubInitiatedEmail for:", email);

  const subject = "Langganan Anda Sedang Diproses";
  const html = `
    <h1>Langganan Bermula</h1>
    <p>Anda telah memulakan proses langganan semula. Sila lengkapkan pembayaran melalui pautan yang disediakan.</p>
    <p>Kami akan menghantar e-mel pengesahan selepas pembayaran anda berjaya.</p>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
  });
}
