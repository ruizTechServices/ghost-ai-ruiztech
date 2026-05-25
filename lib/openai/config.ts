import "server-only";

import type { ResponsesModel } from "openai/resources/shared";

import { OpenAIConfigurationError } from "@/lib/openai/errors";

const OPENAI_API_KEY_ENV = "OPENAI_API_KEY";
const OPENAI_DESIGN_AGENT_MODEL = "gpt-5.4-mini" satisfies ResponsesModel;
const OPENAI_SPEC_GENERATION_MODEL = "gpt-5.4-mini" satisfies ResponsesModel;
const OPENAI_DEFAULT_MAX_RETRIES = 2;
const OPENAI_DEFAULT_TIMEOUT_MS = 120_000;

interface OpenAIEnv {
  apiKey: string;
}

const getOpenAIEnv = (): OpenAIEnv => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new OpenAIConfigurationError(
      `${OPENAI_API_KEY_ENV} is not configured.`,
    );
  }

  return { apiKey };
};

export {
  getOpenAIEnv,
  OPENAI_API_KEY_ENV,
  OPENAI_DEFAULT_MAX_RETRIES,
  OPENAI_DEFAULT_TIMEOUT_MS,
  OPENAI_DESIGN_AGENT_MODEL,
  OPENAI_SPEC_GENERATION_MODEL,
};
export type { OpenAIEnv };
