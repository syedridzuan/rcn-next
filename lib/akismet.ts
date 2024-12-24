// lib/akismet.ts
import { AkismetClient } from "akismet-api"

/**
 * Instantiate a single Akismet client instance.
 * 
 * Make sure you have the following environment variables set in your .env:
 *   AKISMET_API_KEY="your_akismet_api_key"
 *   AKISMET_BLOG_URL="https://example.com"
 */
export const akismet = new AkismetClient({
  key: process.env.AKISMET_API_KEY || "",
  blog: process.env.AKISMET_BLOG_URL || "",
})

/**
 * Optionally verify that your API key is valid.
 * You can call this in a script or at app startup.
 */
export async function verifyAkismetKey() {
  const valid = await akismet.verifyKey()
  if (!valid) {
    throw new Error("Invalid Akismet key. Please check AKISMET_API_KEY / AKISMET_BLOG_URL.")
  }
}

/**
 * Check a given comment for spam.
 * 
 * For a more accurate check, fill out the fields: 
 *   - user_ip, user_agent, referrer, etc.
 */
export async function checkCommentForSpam(data: {
  user_ip?: string
  user_agent?: string
  referrer?: string
  comment_author?: string
  comment_author_email?: string
  comment_author_url?: string
  comment_content: string
}): Promise<boolean> {
  return akismet.checkSpam(data)
}