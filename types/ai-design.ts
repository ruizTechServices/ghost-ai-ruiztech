type AiDesignStatus =
  | "started"
  | "reading"
  | "planning"
  | "applying"
  | "saving"
  | "completed"
  | "failed";

interface AiStatusEvent extends Record<string, string> {
  createdAt: string;
  id: string;
  message: string;
  projectId: string;
  roomId: string;
  runId: string;
  status: AiDesignStatus;
  type: "ai-status";
}

export type { AiDesignStatus, AiStatusEvent };
