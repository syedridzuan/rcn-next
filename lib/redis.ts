// lib/redis.ts
import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL, // or wherever your Redis is hosted
});

redisClient
  .connect()
  .then(() => console.log("Connected to Redis!"))
  .catch((err) => console.error("Redis connection error:", err));
