import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Verify the request is from our middleware
    const isMiddlewareRequest =
      request.headers.get("x-middleware-request") === "true";
    if (!isMiddlewareRequest) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const userId = params.userId;
    if (!userId) {
      return new NextResponse(JSON.stringify({ error: "User ID required" }), {
        status: 400,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error in user status API:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
      }
    );
  }
}
