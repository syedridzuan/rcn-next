// File: app/api/admin/users/[id]/suspend/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1) Await the route params
    const { id } = await context.params;

    // 2) Auth check
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 3) Don't allow suspending yourself
    if (id === session.user.id) {
      return NextResponse.json(
        { success: false, error: "Cannot suspend your own account" },
        { status: 400 }
      );
    }

    // 4) Update user status
    await prisma.user.update({
      where: { id },
      data: {
        status: "SUSPENDED",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[USER_SUSPEND]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
