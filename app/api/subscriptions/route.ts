import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; // or wherever you import your new auth() from
import { prisma } from "@/lib/db"; // your Prisma client

export async function GET(request: NextRequest) {
  // Get the user via NextAuth v5
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log("Session user ID:", session?.user?.id);
  try {
    // Example: Fetch user's active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { notIn: ["CANCELLED", "EXPIRED"] },
      },
    });
    console.log("Seeded subscription:", subscription);
    // Return subscription data (could be null if none found)
    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to retrieve subscription" },
      { status: 500 }
    );
  }
}
