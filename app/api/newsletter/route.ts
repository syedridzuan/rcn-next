// app/api/newsletter/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  // 1. Extract the "token" query param
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    // Return JSON or redirect
    return NextResponse.json(
      { error: "Tiada token pengesahan disediakan." },
      { status: 400 }
    );
  }

  // 2. Check subscriber by token
  const subscriber = await prisma.subscriber.findFirst({
    where: { verificationToken: token },
  });

  if (!subscriber) {
    return NextResponse.json(
      { error: "Token pengesahan tidak sah atau telah tamat." },
      { status: 400 }
    );
  }

  // 3. Mark as verified if not already
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

  // 4. Optional: Instead of JSON, you can redirect to a success page
  // return NextResponse.redirect(new URL("/newsletter/verify/success", request.url));

  // If you want JSON response:
  return NextResponse.json({
    message: "Emel anda telah disahkan! Terima kasih kerana melanggan.",
  });
}
