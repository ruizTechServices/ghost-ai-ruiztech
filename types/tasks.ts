import { z } from "zod";

const AI_STATUS_FEED = "ai-status-feed";
const AI_STATUS_EVENT_TYPE = "ai-status";
const AI_CHAT_FEED = "ai-chat";
const AI_CHAT_EVENT_TYPE = "ai-chat-message";

const AI_TASK_STATUSES = [
  "started",
  "reading",
  "planning",
  "applying",
  "saving",
  "completed",
  "failed",
] as const;
const AI_CHAT_ROLES = ["assistant", "user"] as const;

type AiTaskStatus = (typeof AI_TASK_STATUSES)[number];
type AiChatRole = (typeof AI_CHAT_ROLES)[number];

interface AiStatusFeedMessage extends Record<string, string> {
  createdAt: string;
  feed: typeof AI_STATUS_FEED;
  id: string;
  message: string;
  projectId: string;
  roomId: string;
  runId: string;
  status: AiTaskStatus;
  text: string;
  type: typeof AI_STATUS_EVENT_TYPE;
}

interface AiChatSender extends Record<string, string> {
  avatar: string;
  color: string;
  id: string;
  name: string;
}

interface AiChatFeedMessage extends Record<string, string | AiChatSender> {
  content: string;
  feed: typeof AI_CHAT_FEED;
  id: string;
  role: AiChatRole;
  roomId: string;
  sender: AiChatSender;
  timestamp: string;
  type: typeof AI_CHAT_EVENT_TYPE;
}

type AiRoomEvent = AiStatusFeedMessage | AiChatFeedMessage;

const statusValues = new Set<string>(AI_TASK_STATUSES);

const aiChatFeedMessageSchema = z
  .object({
    content: z.string().trim().min(1),
    feed: z.literal(AI_CHAT_FEED),
    id: z.string().trim().min(1),
    role: z.enum(AI_CHAT_ROLES),
    roomId: z.string().trim().min(1),
    sender: z
      .object({
        avatar: z.string(),
        color: z.string(),
        id: z.string().trim().min(1),
        name: z.string().trim().min(1),
      })
      .strict(),
    timestamp: z.string().datetime({ offset: true }),
    type: z.literal(AI_CHAT_EVENT_TYPE),
  })
  .strict();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string =>
  typeof value === "string";

const isOptionalString = (value: unknown): value is string | undefined =>
  value === undefined || isString(value);

const isAiTaskStatus = (value: unknown): value is AiTaskStatus =>
  isString(value) && statusValues.has(value);

const isAiStatusFeedMessage = (
  value: unknown,
): value is AiStatusFeedMessage =>
  isRecord(value) &&
  value.type === AI_STATUS_EVENT_TYPE &&
  value.feed === AI_STATUS_FEED &&
  isString(value.id) &&
  isString(value.createdAt) &&
  isString(value.projectId) &&
  isString(value.roomId) &&
  isString(value.runId) &&
  isAiTaskStatus(value.status) &&
  isOptionalString(value.text) &&
  isOptionalString(value.message);

const isAiChatFeedMessage = (
  value: unknown,
): value is AiChatFeedMessage => aiChatFeedMessageSchema.safeParse(value).success;

const getAiStatusFeedText = (event: AiStatusFeedMessage): string =>
  (event.text ?? event.message ?? "").trim();

const isAiStatusActive = (event: AiStatusFeedMessage | null): boolean =>
  event !== null && event.status !== "completed" && event.status !== "failed";

export {
  AI_CHAT_EVENT_TYPE,
  AI_CHAT_FEED,
  AI_CHAT_ROLES,
  AI_STATUS_EVENT_TYPE,
  AI_STATUS_FEED,
  AI_TASK_STATUSES,
  getAiStatusFeedText,
  isAiChatFeedMessage,
  isAiStatusActive,
  isAiStatusFeedMessage,
};
export type {
  AiChatFeedMessage,
  AiChatRole,
  AiChatSender,
  AiRoomEvent,
  AiStatusFeedMessage,
  AiTaskStatus,
};
