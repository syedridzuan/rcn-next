import { Redis } from "@upstash/redis";

if (
  !process.env.UPSTASH_REDIS_REST_URL ||
  !process.env.UPSTASH_REDIS_REST_TOKEN
) {
  throw new Error("Redis environment variables are not set");
}

export const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Test connection function
export async function testConnection(): Promise<void> {
  try {
    console.log("Redis configuration:", {
      url: process.env.UPSTASH_REDIS_REST_URL ? "Set" : "Not set",
      token: process.env.UPSTASH_REDIS_REST_TOKEN ? "Set" : "Not set",
    });

    // Test connection by setting and getting a value
    await redisClient.set("test-connection", "working");
    const testValue = await redisClient.get("test-connection");

    if (testValue === "working") {
      console.log("✅ Redis connection successful");
      await redisClient.del("test-connection"); // Clean up test key
    } else {
      console.error("❌ Redis connection test failed");
    }
  } catch (error) {
    console.error("❌ Redis connection error:", error);
    throw error;
  }
}

export default redisClient;
