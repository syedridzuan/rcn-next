import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

export async function rateLimit(
  request: NextRequest,
  { windowMs = 60000, max = 5 } = {}
) {
  try {
    const ip = request.ip ?? '127.0.0.1'
    const key = `rate-limit:${ip}`
    
    const count = await redis.incr(key)
    
    if (count === 1) {
      await redis.pexpire(key, windowMs)
    }
    
    const ttl = await redis.pttl(key)
    
    if (count > max) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          timeout: ttl,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': (Date.now() + ttl).toString(),
          },
        }
      )
    }
    
    return null
  } catch (error) {
    console.error('Rate limit error:', error)
    return null // Continue if rate limiting fails
  }
} 