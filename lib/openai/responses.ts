import "server-only";

import type {
  Response,
  ResponseFormatTextJSONSchemaConfig,
  ResponseUsage,
} from "openai/resources/responses/responses";
import type { ResponsesModel } from "openai/resources/shared";

import { getOpenAIClient } from "@/lib/openai/client";
import { OPENAI_DESIGN_AGENT_MODEL } from "@/lib/openai/config";
import { OpenAIResponseFormatError } from "@/lib/openai/errors";

type JsonSchema = ResponseFormatTextJSONSchemaConfig["schema"];

interface StructuredResponseSchema {
  description?: string;
  name: string;
  schema: JsonSchema;
}

interface CreateStructuredResponseParams<T> {
  input: string;
  instructions: string;
  maxOutputTokens?: number;
  metadata?: Record<string, string>;
  model?: ResponsesModel;
  safetyIdentifier?: string;
  schema: StructuredResponseSchema;
  validate: (value: unknown) => value is T;
}

interface StructuredResponseResult<T> {
  data: T;
  model: string;
  requestId: string | null;
  response: Response;
  responseId: string;
  usage: ResponseUsage | null;
}

const parseJson = (rawText: string): unknown => {
  try {
    return JSON.parse(rawText) as unknown;
  } catch {
    throw new OpenAIResponseFormatError("OpenAI returned malformed JSON.");
  }
};

const createStructuredResponse = async <T>({
  input,
  instructions,
  maxOutputTokens,
  metadata,
  model = OPENAI_DESIGN_AGENT_MODEL,
  safetyIdentifier,
  schema,
  validate,
}: CreateStructuredResponseParams<T>): Promise<StructuredResponseResult<T>> => {
  const response = await getOpenAIClient().responses.create({
    input,
    instructions,
    max_output_tokens: maxOutputTokens,
    metadata,
    model,
    safety_identifier: safetyIdentifier,
    store: false,
    text: {
      format: {
        description: schema.description,
        name: schema.name,
        schema: schema.schema,
        strict: true,
        type: "json_schema",
      },
      verbosity: "low",
    },
  });

  const rawText = response.output_text;

  if (!rawText) {
    throw new OpenAIResponseFormatError("OpenAI returned an empty response.");
  }

  const parsed = parseJson(rawText);

  if (!validate(parsed)) {
    throw new OpenAIResponseFormatError(
      "OpenAI returned JSON that does not match the expected schema.",
    );
  }

  return {
    data: parsed,
    model: response.model,
    requestId: response._request_id ?? null,
    response,
    responseId: response.id,
    usage: response.usage ?? null,
  };
};

export { createStructuredResponse };
export type {
  CreateStructuredResponseParams,
  JsonSchema,
  StructuredResponseResult,
  StructuredResponseSchema,
};
