import { tasks } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";

import { checkProjectAccess, getCurrentClerkIdentity } from "@/lib/project-access";
import {
  createTaskRun,
  TASK_TYPE_DESIGN_GENERATION,
} from "@/lib/supabase/task-runs";
import {
  DESIGN_AGENT_TASK_ID,
  type designAgentTask,
  type DesignAgentPayload,
} from "@/lib/trigger/design-agent";

export const runtime = "nodejs";

interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

interface DesignRequestBody {
  projectId?: unknown;
  prompt?: unknown;
  roomId?: unknown;
}

const projectIdPattern = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

const jsonError = (status: number, code: string, message: string) =>
  NextResponse.json<ApiError>({ error: { code, message } }, { status });

const readRequestBody = async (
  request: Request,
): Promise<DesignRequestBody | null> => {
  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  return body as DesignRequestBody;
};

export const POST = async (request: Request) => {
  const identity = await getCurrentClerkIdentity();

  if (!identity.userId) {
    return jsonError(401, "UNAUTHENTICATED", "Authentication is required.");
  }

  const body = await readRequestBody(request);

  if (!body) {
    return jsonError(400, "INVALID_REQUEST", "Request body must be JSON.");
  }

  if (typeof body.projectId !== "string") {
    return jsonError(400, "INVALID_PROJECT_ID", "Project ID is required.");
  }

  const projectId = body.projectId;

  if (!projectIdPattern.test(projectId)) {
    return jsonError(400, "INVALID_PROJECT_ID", "Project ID is invalid.");
  }

  if (
    body.roomId !== undefined &&
    (typeof body.roomId !== "string" || body.roomId !== projectId)
  ) {
    return jsonError(
      400,
      "ROOM_PROJECT_MISMATCH",
      "Room ID must match project ID.",
    );
  }

  const roomId = typeof body.roomId === "string" ? body.roomId : projectId;
  const { access } = await checkProjectAccess({ ...identity, roomId });

  if (!access) {
    return jsonError(403, "FORBIDDEN", "Project access is required.");
  }

  if (typeof body.prompt !== "string" || body.prompt.trim().length === 0) {
    return jsonError(400, "INVALID_PROMPT", "Prompt is required.");
  }

  const payload: DesignAgentPayload = {
    primaryEmail: identity.primaryEmail,
    projectId,
    prompt: body.prompt.trim(),
    roomId,
    userId: identity.userId,
  };

  try {
    const handle = await tasks.trigger<typeof designAgentTask>(
      DESIGN_AGENT_TASK_ID,
      payload,
    );

    await createTaskRun({
      projectId,
      runId: handle.id,
      taskType: TASK_TYPE_DESIGN_GENERATION,
      userId: identity.userId,
    });

    return NextResponse.json({ runId: handle.id });
  } catch (error) {
    console.error("Failed to trigger design agent task.", error);

    return jsonError(
      500,
      "DESIGN_TASK_TRIGGER_FAILED",
      "Failed to start design generation.",
    );
  }
};
