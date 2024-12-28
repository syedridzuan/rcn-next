import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db"; // your Prisma client
import { hash } from "bcryptjs";

// 1. Define a Zod schema for the request body
const CreatePasswordSchema = z.object({
  token: z.string().min(1, "Token is required."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(128, "Password too long."),
  name: z.string().min(1, "Full name is required.").max(100),
});

export async function POST(request: NextRequest) {
  try {
    // 2. Parse and validate the request body
    const json = await request.json();
    const { token, password, name } = CreatePasswordSchema.parse(json);

    // 3. Check the verification token in the DB
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Token is invalid or has already been used." },
        { status: 400 }
      );
    }

    // Optional: Check if the token is expired
    const now = new Date();
    if (verificationToken.expires < now) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json(
        { error: "Token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // 4. Retrieve the user by identifier (often stored in `verificationToken.identifier`)
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
      // or if your identifier is the userId, do: where: { id: verificationToken.identifier }
    });

    if (!user) {
      // Clean up token to avoid orphaned data
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json(
        { error: "User not found. Cannot set password." },
        { status: 404 }
      );
    }

    // 5. Hash the new password
    const hashedPassword = await hash(password, 10);

    // 6. Update the user’s password, full name, and mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        name,
        emailVerified: new Date(), // <— Mark email as verified
      },
    });

    // 7. Invalidate the token so it can’t be reused
    await prisma.verificationToken.delete({ where: { token } });

    // 8. Return success
    return NextResponse.json(
      {
        message:
          "Password, name, and emailVerified have been set successfully.",
      },
      { status: 200 }
    );
  } catch (err: any) {
    // Handle Zod errors or other exceptions
    if (err.name === "ZodError") {
      return NextResponse.json(
        { error: err.errors?.[0]?.message || "Validation error." },
        { status: 400 }
      );
    }

    console.error("Error in create-password route:", err);
    return NextResponse.json(
      { error: "Failed to set password. Please try again." },
      { status: 500 }
    );
  }
}
