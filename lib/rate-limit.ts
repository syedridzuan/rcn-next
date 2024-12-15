import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
})

export async function checkRateLimit(identifier: string) {
  try {
    const { success, limit, reset, remaining } = await ratelimit.limit(identifier)
    
    return {
      success,
      limit,
      reset,
      remaining,
    }
  } catch (error) {
    console.error("[RATE_LIMIT_ERROR]", error)
    // If rate limiting fails, we'll allow the request through
    return {
      success: true,
      limit: 0,
      reset: 0,
      remaining: 0,
    }
  }
}