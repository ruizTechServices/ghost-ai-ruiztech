import OpenAI from "openai";

class OpenAIConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAIConfigurationError";
  }
}

class OpenAIResponseFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAIResponseFormatError";
  }
}

interface SafeOpenAIErrorDetails {
  message: string;
  requestId: string | null;
  status: number | null;
  type: string;
}

const getSafeOpenAIErrorDetails = (
  error: unknown,
): SafeOpenAIErrorDetails => {
  if (error instanceof OpenAI.APIError) {
    return {
      message: error.message,
      requestId: error.requestID ?? null,
      status: error.status ?? null,
      type: error.name,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      requestId: null,
      status: null,
      type: error.name,
    };
  }

  return {
    message: "Unknown OpenAI error.",
    requestId: null,
    status: null,
    type: "UnknownOpenAIError",
  };
};

export {
  getSafeOpenAIErrorDetails,
  OpenAIConfigurationError,
  OpenAIResponseFormatError,
};
export type { SafeOpenAIErrorDetails };
