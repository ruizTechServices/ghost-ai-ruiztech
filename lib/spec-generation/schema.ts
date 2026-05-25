import { z } from "zod";

const MAX_SPEC_CHAT_MESSAGES = 100;
const MAX_SPEC_CHAT_CONTENT_LENGTH = 8_000;
const MAX_SPEC_NODES = 250;
const MAX_SPEC_EDGES = 500;

const ROOM_SAFE_ID_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

const canvasNodeShapes = [
  "circle",
  "cylinder",
  "diamond",
  "hexagon",
  "pill",
  "rectangle",
] as const;

const chatRoles = ["assistant", "user"] as const;

const roomSafeIdSchema = z
  .string()
  .trim()
  .min(1, "Room ID is required.")
  .regex(ROOM_SAFE_ID_PATTERN, "Room ID is invalid.");

const finiteNumberSchema = z.number().finite();

const chatMessageSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(1, "Chat message content is required.")
      .max(MAX_SPEC_CHAT_CONTENT_LENGTH, "Chat message content is too long."),
    role: z.enum(chatRoles),
  })
  .passthrough();

const canvasNodeSchema = z
  .object({
    data: z
      .object({
        color: z.string().trim().min(1),
        label: z.string(),
        shape: z.enum(canvasNodeShapes),
        textColor: z.string().optional(),
      })
      .passthrough(),
    height: finiteNumberSchema.optional(),
    id: z.string().trim().min(1),
    position: z
      .object({
        x: finiteNumberSchema,
        y: finiteNumberSchema,
      })
      .strict(),
    style: z.record(z.string(), z.unknown()).optional(),
    type: z.literal("canvasNode"),
    width: finiteNumberSchema.optional(),
  })
  .passthrough();

const canvasEdgeSchema = z
  .object({
    data: z
      .object({
        label: z.string().optional(),
      })
      .passthrough()
      .optional(),
    id: z.string().trim().min(1),
    source: z.string().trim().min(1),
    sourceHandle: z.string().nullable().optional(),
    target: z.string().trim().min(1),
    targetHandle: z.string().nullable().optional(),
    type: z.literal("canvasEdge"),
  })
  .passthrough();

const specGenerationRequestSchema = z
  .object({
    chatHistory: z.array(chatMessageSchema).max(MAX_SPEC_CHAT_MESSAGES),
    edges: z.array(canvasEdgeSchema).max(MAX_SPEC_EDGES),
    nodes: z.array(canvasNodeSchema).max(MAX_SPEC_NODES),
    roomId: roomSafeIdSchema,
  })
  .strict();

const generateSpecPayloadSchema = specGenerationRequestSchema
  .extend({
    primaryEmail: z.string().trim().email().nullable(),
    projectId: roomSafeIdSchema,
    userId: z.string().trim().min(1),
  })
  .strict();

type SpecGenerationRequest = z.infer<typeof specGenerationRequestSchema>;
type GenerateSpecPayload = z.infer<typeof generateSpecPayloadSchema>;
type GenerateSpecChatMessage = z.infer<typeof chatMessageSchema>;
type GenerateSpecNode = z.infer<typeof canvasNodeSchema>;
type GenerateSpecEdge = z.infer<typeof canvasEdgeSchema>;

export {
  generateSpecPayloadSchema,
  specGenerationRequestSchema,
};
export type {
  GenerateSpecChatMessage,
  GenerateSpecEdge,
  GenerateSpecNode,
  GenerateSpecPayload,
  SpecGenerationRequest,
};
