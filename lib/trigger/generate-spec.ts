import { logger, metadata, schemaTask } from "@trigger.dev/sdk";

import { OPENAI_SPEC_GENERATION_MODEL } from "@/lib/openai/config";
import { getOpenAIClient } from "@/lib/openai/client";
import { getSafeOpenAIErrorDetails } from "@/lib/openai/errors";
import {
  checkProjectMembership,
  type ProjectMembershipIdentity,
} from "@/lib/supabase/project-membership";
import { createProjectSpec } from "@/lib/supabase/project-specs";
import {
  generateSpecPayloadSchema,
  type GenerateSpecChatMessage,
  type GenerateSpecEdge,
  type GenerateSpecNode,
  type GenerateSpecPayload,
} from "@/lib/spec-generation/schema";

const GENERATE_SPEC_TASK_ID = "generate-spec";

const SPEC_GENERATION_INSTRUCTIONS = [
  "You are Ghost AI, a senior systems architect generating a technical specification from a collaborative architecture canvas.",
  "Produce plain Markdown only. Do not wrap the response in a code fence.",
  "Use only the supplied canvas and chat context; when a detail is missing, call it out as an assumption or open question instead of inventing specifics.",
  "Include concise sections for overview, architecture, components, data flow, operational concerns, risks, and open questions.",
].join("\n");

const formatChatHistory = (chatHistory: GenerateSpecChatMessage[]): string => {
  if (chatHistory.length === 0) {
    return "No chat history was provided.";
  }

  return chatHistory
    .map((message, index) => {
      const role = message.role === "user" ? "User" : "Assistant";
      return `${index + 1}. ${role}: ${message.content}`;
    })
    .join("\n");
};

const formatNodes = (nodes: GenerateSpecNode[]): string => {
  if (nodes.length === 0) {
    return "No canvas nodes were provided.";
  }

  return JSON.stringify(
    nodes.map((node) => ({
      id: node.id,
      label: node.data.label.trim() || "(unlabeled)",
      position: node.position,
      shape: node.data.shape,
      size: {
        height: node.height,
        width: node.width,
      },
    })),
    null,
    2,
  );
};

const formatEdges = (edges: GenerateSpecEdge[]): string => {
  if (edges.length === 0) {
    return "No canvas edges were provided.";
  }

  return JSON.stringify(
    edges.map((edge) => ({
      id: edge.id,
      label: edge.data?.label?.trim() || "",
      source: edge.source,
      sourceHandle: edge.sourceHandle ?? null,
      target: edge.target,
      targetHandle: edge.targetHandle ?? null,
    })),
    null,
    2,
  );
};

const createSpecPrompt = (payload: GenerateSpecPayload): string => `
Project ID: ${payload.projectId}
Room ID: ${payload.roomId}

Chat context:
${formatChatHistory(payload.chatHistory)}

Canvas nodes:
${formatNodes(payload.nodes)}

Canvas edges:
${formatEdges(payload.edges)}
`;

const generateMarkdownSpec = async (
  payload: GenerateSpecPayload,
): Promise<{
  markdown: string;
  model: string;
  requestId: string | null;
  responseId: string;
}> => {
  const response = await getOpenAIClient().responses.create({
    input: createSpecPrompt(payload),
    instructions: SPEC_GENERATION_INSTRUCTIONS,
    max_output_tokens: 6_000,
    metadata: {
      feature: "spec-generation",
      projectId: payload.projectId,
      roomId: payload.roomId,
    },
    model: OPENAI_SPEC_GENERATION_MODEL,
    safety_identifier: payload.userId,
    store: false,
    text: {
      verbosity: "medium",
    },
  });
  const markdown = response.output_text.trim();

  if (markdown.length === 0) {
    throw new Error("OpenAI returned an empty spec.");
  }

  return {
    markdown,
    model: response.model,
    requestId: response._request_id ?? null,
    responseId: response.id,
  };
};

const updateStatus = ({
  message,
  progress,
  status,
}: {
  message: string;
  progress: number;
  status:
    | "completed"
    | "failed"
    | "planning"
    | "reading"
    | "saving"
    | "started";
}) => {
  metadata.set("status", status);
  metadata.set("message", message);
  metadata.set("progress", progress);
};

export const generateSpec = schemaTask({
  id: GENERATE_SPEC_TASK_ID,
  retry: {
    maxAttempts: 1,
  },
  schema: generateSpecPayloadSchema,
  run: async (payload, { ctx }) => {
    const runId = ctx.run.id;
    const identity: ProjectMembershipIdentity = {
      primaryEmail: payload.primaryEmail,
      userId: payload.userId,
    };

    try {
      updateStatus({
        message: "Starting spec generation.",
        progress: 5,
        status: "started",
      });

      if (payload.projectId !== payload.roomId) {
        throw new Error("Project ID and room ID must match.");
      }

      const { access } = await checkProjectMembership({
        ...identity,
        projectId: payload.projectId,
      });

      if (!access) {
        throw new Error("Project access is required.");
      }

      updateStatus({
        message: "Reading canvas and chat context.",
        progress: 25,
        status: "reading",
      });
      metadata.set("nodeCount", payload.nodes.length);
      metadata.set("edgeCount", payload.edges.length);
      metadata.set("chatMessageCount", payload.chatHistory.length);

      updateStatus({
        message: "Generating Markdown technical spec.",
        progress: 65,
        status: "planning",
      });
      logger.info("Generating project spec", {
        edgeCount: payload.edges.length,
        model: OPENAI_SPEC_GENERATION_MODEL,
        nodeCount: payload.nodes.length,
        projectId: payload.projectId,
        roomId: payload.roomId,
        runId,
      });

      const { markdown, model, requestId, responseId } =
        await generateMarkdownSpec(payload);

      metadata.set("openaiModel", model);
      metadata.set("openaiResponseId", responseId);
      if (requestId) {
        metadata.set("openaiRequestId", requestId);
      }
      metadata.set("specCharacterCount", markdown.length);
      updateStatus({
        message: "Saving generated spec.",
        progress: 85,
        status: "saving",
      });

      const spec = await createProjectSpec({
        identity,
        markdown,
        projectId: payload.projectId,
      });

      metadata.set("specId", spec.id);
      metadata.set("specFilePath", spec.file_path);
      updateStatus({
        message: "Spec generation completed.",
        progress: 100,
        status: "completed",
      });

      return markdown;
    } catch (error) {
      const safeDetails = getSafeOpenAIErrorDetails(error);
      const message = safeDetails.message;

      logger.error("Spec generation failed", {
        error: message,
        requestId: safeDetails.requestId,
        errorStatus: safeDetails.status,
        errorType: safeDetails.type,
        projectId: payload.projectId,
        roomId: payload.roomId,
        runId,
      });
      updateStatus({
        message: `Spec generation failed: ${message}`,
        progress: 100,
        status: "failed",
      });

      throw error;
    }
  },
});

export { GENERATE_SPEC_TASK_ID };
export type { GenerateSpecPayload };
