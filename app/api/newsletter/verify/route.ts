import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    if (!token) {
      // Missing token => redirect to "invalid" page
      return NextResponse.redirect(new URL("/newsletter/invalid", request.url));
    }

    const subscriber = await prisma.subscriber.findUnique({
      // For "unique" queries, you must use an @unique or @id field.
      // If `verificationToken` is not unique in your schema, you can
      // use `findFirst` with a `where` instead.
      where: { verificationToken: token },
    });

    if (!subscriber) {
      // Invalid token => redirect to "invalid"
      return NextResponse.redirect(new URL("/newsletter/invalid", request.url));
    }

    // 1. Mark the subscriber as verified
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verifiedAt: new Date(),
      },
    });

    // 2. Redirect to success
    return NextResponse.redirect(new URL("/newsletter/success", request.url));
  } catch (err: unknown) {
    // 3. If anything unexpected occurs => redirect to "failed"
    console.error("Newsletter verification error:", err);
    return NextResponse.redirect(new URL("/newsletter/failed", request.url));
  }
}
