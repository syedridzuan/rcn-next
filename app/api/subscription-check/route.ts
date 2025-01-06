// File: app/api/subscription-check/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { hasActiveSubscription } from "@/lib/subscription";

export async function GET() {
  // 1) Check auth
  const session = await auth();
  if (!session?.user?.id) {
    // If user not logged in, we can return isActive: false or a 401
    return NextResponse.json(
      { isActive: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  // 2) Check subscription
  const userId = session.user.id;
  const isActive = await hasActiveSubscription(userId);

  // 3) Return JSON
  // Something like: { isActive: true/false }
  return NextResponse.json({ isActive });
}
