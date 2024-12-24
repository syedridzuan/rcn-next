"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// The shape of the data from the NotificationForm
interface NotificationPreferences {
  subscribeNewsletter: boolean;
  subscribeCommentReply: boolean;
  subscribeRecipeComment: boolean;
}

export async function updateNotificationPreferences(
  data: NotificationPreferences
) {
  // Verify user is authenticated
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  // Update the user record in DB
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      subscribeNewsletter: data.subscribeNewsletter,
      subscribeCommentReply: data.subscribeCommentReply,
      subscribeRecipeComment: data.subscribeRecipeComment,
    },
  });

  // Optionally revalidate this path or others if needed
  revalidatePath("/account/notifications");
  // Return success or any data you want
  return { success: true };
}
