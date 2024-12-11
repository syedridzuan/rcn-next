import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { headers } from "next/headers"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Create a new ratelimiter that allows 5 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    Number(process.env.RATE_LIMIT_REQUESTS) || 5,
    "10 s"
  ),
})

export interface RateLimitResponse {
  success: boolean
  remaining: number
  limit: number
  reset: number
}

export async function getRateLimitMiddleware(
  key: string
): Promise<RateLimitResponse> {
  try {
    // Get headers and await them
    const headersList = await headers()
    const forwardedFor = headersList.get("x-forwarded-for")
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : "127.0.0.1"

    // Apply rate limiting
    const { success, limit, remaining, reset } = await ratelimit.limit(
      `${key}_${ip}`
    )

    return {
      success,
      remaining,
      limit,
      reset
    }
  } catch (error) {
    console.error("Rate limit error:", error)
    return {
      success: true, // Fail open
      remaining: 1,
      limit: 5,
      reset: Date.now() + 10000
    }
  }
}