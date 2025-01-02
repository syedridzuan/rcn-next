// app/api/newsletter/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import crypto from "crypto";

const ses = new SESClient({
  region: process.env.AWS_SES_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * GET /api/newsletter
 *  - Example: Admin-only route to fetch all subscribers
 *  - If you do not want normal users to access the subscriber list,
 *    you can keep the role check.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscribers = await prisma.subscriber.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error("Failed to fetch subscribers:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/newsletter
 *  - Public route so that normal visitors can subscribe.
 *  - No admin checks => anyone can sign up with their email.
 *  - If you still want to allow "admin creation" you can
 *    do it all in one route, or separate them.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email?.trim();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    // 1. Check if this email already subscribed
    //    - Or you can do an `upsert`, depending on your logic
    const existing = await prisma.subscriber.findUnique({
      where: { email },
    });
    if (existing) {
      // If they are verified, we can just say "You are already subscribed."
      if (existing.isVerified) {
        return NextResponse.json({
          message: "Anda telah pun melanggan newsletter kami sebelum ini.",
        });
      } else {
        // They exist but not verified => re-send verification link or error out
        return NextResponse.json({
          message:
            "Anda telah mendaftar tetapi belum mengesahkan emel. Sila semak emel anda untuk pautan pengesahan.",
        });
      }
    }

    // 2. Create subscriber
    const verificationToken = crypto.randomUUID();
    const subscriber = await prisma.subscriber.create({
      data: {
        email,
        isVerified: false,
        verificationToken,
        verifiedAt: null,
      },
    });

    // 3. Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/verify?token=${verificationToken}`;

    const command = new SendEmailCommand({
      Source: process.env.AWS_SES_FROM_EMAIL!,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: { Data: "Sahkan Langganan Newsletter Anda" },
        Body: {
          Html: {
            Data: `
              <h1>Sahkan Langganan Emel</h1>
              <p>Sila klik pautan di bawah untuk mengesahkan langganan anda:</p>
              <a href="${verificationUrl}">${verificationUrl}</a>
              <p>Jika ini bukan permintaan anda, abaikan emel ini.</p>
            `,
          },
        },
      },
    });

    await ses.send(command);

    // Return success JSON
    return NextResponse.json({
      message: "Pendaftaran berjaya! Sila semak emel anda untuk pengesahan.",
    });
  } catch (error) {
    console.error("Failed to create subscriber:", error);
    return NextResponse.json(
      { error: "Ralat semasa membuat langganan newsletter." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/newsletter/verify?token=xxx
 *  - This can be a separate route if you want, but for simplicity,
 *    you can do it all in one route with `searchParams`.
 */
export async function verifySubscription(request: NextRequest) {
  // 1. Extract token from query
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Tiada token disediakan." },
      { status: 400 }
    );
  }

  // 2. Check subscriber
  const subscriber = await prisma.subscriber.findFirst({
    where: { verificationToken: token },
  });

  if (!subscriber) {
    return NextResponse.json(
      { error: "Token tidak sah atau telah tamat." },
      { status: 400 }
    );
  }

  // 3. Mark as verified
  if (!subscriber.isVerified) {
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verifiedAt: new Date(),
      },
    });
  }

  // 4. Return success or redirect
  return NextResponse.json({
    message: "Emel anda telah disahkan! Terima kasih kerana melanggan.",
  });
}
