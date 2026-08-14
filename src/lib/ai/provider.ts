import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";

export type AIProviderName = "openai" | "google";

// Helper function to pick the provider based on env vars
export const getActiveProvider = (): AIProviderName => {
  if (process.env.OPENAI_API_KEY) {
    return "openai";
  }
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return "google";
  }
  // Default to openai if neither is set (will throw error later if key missing)
  return "openai";
};

// Returns a fast model suitable for quick tasks (summaries, simple chat, SEO)
export const getFastModel = () => {
  const provider = getActiveProvider();
  
  if (provider === "google") {
    return google("gemini-1.5-flash");
  }
  
  return openai("gpt-4o-mini");
};

// Returns a highly capable reasoning model suitable for complex tasks (deep analysis)
export const getReasoningModel = () => {
  const provider = getActiveProvider();
  
  if (provider === "google") {
    return google("gemini-1.5-pro");
  }
  
  return openai("gpt-4o");
};
