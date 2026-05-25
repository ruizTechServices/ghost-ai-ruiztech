const AI_STATUS_FEED = "ai-status-feed";
const AI_STATUS_EVENT_TYPE = "ai-status";

const AI_TASK_STATUSES = [
  "started",
  "reading",
  "planning",
  "applying",
  "saving",
  "completed",
  "failed",
] as const;

type AiTaskStatus = (typeof AI_TASK_STATUSES)[number];

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

const statusValues = new Set<string>(AI_TASK_STATUSES);

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

const getAiStatusFeedText = (event: AiStatusFeedMessage): string =>
  (event.text ?? event.message ?? "").trim();

const isAiStatusActive = (event: AiStatusFeedMessage | null): boolean =>
  event !== null && event.status !== "completed" && event.status !== "failed";

export {
  AI_STATUS_EVENT_TYPE,
  AI_STATUS_FEED,
  AI_TASK_STATUSES,
  getAiStatusFeedText,
  isAiStatusActive,
  isAiStatusFeedMessage,
};
export type { AiStatusFeedMessage, AiTaskStatus };
