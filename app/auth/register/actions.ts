"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { RegisterSchema } from "@/lib/validations/auth";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email"; // <-- Import from lib/email

export async function registerAction(input: z.infer<typeof RegisterSchema>) {
  // 1. Validate input
  const result = RegisterSchema.safeParse(input);
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      fieldErrors[issue.path.join(".")] = issue.message;
    });
    return { success: false, fieldErrors };
  }

  // 2. Check if email or username is already registered
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email }, { username: input.username }],
    },
    select: { id: true },
  });
  if (existingUser) {
    return {
      success: false,
      fieldErrors: {
        username: "That username atau email sudah didaftarkan.",
      },
    };
  }

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(input.password, 10);

  // 4. Create user
  const newUser = await prisma.user.create({
    data: {
      name: input.name,
      username: input.username,
      email: input.email,
      password: hashedPassword,
      status: "ACTIVE",
      role: "USER",
    },
  });

  // 5. Create verification token (expires in 24h)
  const tokenValue = crypto.randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await prisma.verificationToken.create({
    data: {
      identifier: newUser.email!,
      token: tokenValue,
      expires,
    },
  });

  // 6. Build verification URL
  const verificationUrl = `${
    process.env.NEXT_PUBLIC_APP_URL
  }/auth/verify?token=${encodeURIComponent(tokenValue)}`;

  // 7. Call our new function from lib/email.ts
  try {
    await sendVerificationEmail(
      newUser.username,
      newUser.email!,
      verificationUrl
    );
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return {
      success: false,
      message: "Gagal menghantar e-mel pengesahan akaun.",
    };
  }

  // Registration succeeded
  return { success: true };
}
