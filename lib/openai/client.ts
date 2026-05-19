import "server-only";

import OpenAI from "openai";

import {
  getOpenAIEnv,
  OPENAI_DEFAULT_MAX_RETRIES,
  OPENAI_DEFAULT_TIMEOUT_MS,
} from "@/lib/openai/config";

let cachedClient: OpenAI | null = null;

const getOpenAIClient = (): OpenAI => {
  if (cachedClient) return cachedClient;

  const { apiKey } = getOpenAIEnv();

  cachedClient = new OpenAI({
    apiKey,
    maxRetries: OPENAI_DEFAULT_MAX_RETRIES,
    timeout: OPENAI_DEFAULT_TIMEOUT_MS,
  });

  return cachedClient;
};

export { getOpenAIClient };
