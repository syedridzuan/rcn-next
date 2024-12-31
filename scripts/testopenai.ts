#!/usr/bin/env tsx

import { config } from "dotenv";
import OpenAI from "openai";

// Load environment variables from .env file
config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function test() {
  console.log("OpenAI client instance:", openai);

  // Example API call to verify setup
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say this is a test" }],
    });
    console.log("Chat completion response:", response);
  } catch (error) {
    console.error("Error fetching chat completion:", error);
  }
}

test();
