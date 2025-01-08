// File: app/api/admin/users/[id]/activate/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * Next.js 15: dynamic route params are async, so we define:
 *   context: { params: Promise<{ id: string }> }
 * and then do: const { id } = await context.params
 */
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1) Await the async route params
    const { id } = await context.params;

    // 2) Check if user is authenticated and is an admin
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 3) Optionally ensure user can’t activate their own account, if needed
    // if (id === session.user.id) {
    //   return NextResponse.json(
    //     { success: false, error: "Cannot modify your own account" },
    //     { status: 400 }
    //   )
    // }

    // 4) Update user status to ACTIVE
    await prisma.user.update({
      where: { id },
      data: {
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[USER_ACTIVATE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
