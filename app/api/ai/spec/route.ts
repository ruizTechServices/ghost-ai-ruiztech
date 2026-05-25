import { tasks } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";

import { checkProjectAccess, getCurrentClerkIdentity } from "@/lib/project-access";
import { specGenerationRequestSchema } from "@/lib/spec-generation/schema";
import {
  createTaskRun,
  TASK_TYPE_SPEC_GENERATION,
} from "@/lib/supabase/task-runs";
import {
  GENERATE_SPEC_TASK_ID,
  type generateSpec,
  type GenerateSpecPayload,
} from "@/lib/trigger/generate-spec";

export const runtime = "nodejs";

interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

const jsonError = (status: number, code: string, message: string) =>
  NextResponse.json<ApiError>({ error: { code, message } }, { status });

const readRequestBody = async (request: Request): Promise<unknown> =>
  request.json().catch(() => null);

export const POST = async (request: Request) => {
  const identity = await getCurrentClerkIdentity();

  if (!identity.userId) {
    return jsonError(401, "UNAUTHENTICATED", "Authentication is required.");
  }

  const body = await readRequestBody(request);
  const parsedBody = specGenerationRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return jsonError(
      400,
      "INVALID_REQUEST",
      parsedBody.error.issues.at(0)?.message ?? "Request body is invalid.",
    );
  }

  const { roomId } = parsedBody.data;
  const { access } = await checkProjectAccess({ ...identity, roomId });

  if (!access) {
    return jsonError(403, "FORBIDDEN", "Project access is required.");
  }

  const payload: GenerateSpecPayload = {
    ...parsedBody.data,
    primaryEmail: identity.primaryEmail,
    projectId: roomId,
    roomId,
    userId: identity.userId,
  };

  try {
    const handle = await tasks.trigger<typeof generateSpec>(
      GENERATE_SPEC_TASK_ID,
      payload,
    );

    await createTaskRun({
      projectId: roomId,
      runId: handle.id,
      taskType: TASK_TYPE_SPEC_GENERATION,
      userId: identity.userId,
    });

    return NextResponse.json({ runId: handle.id });
  } catch (error) {
    console.error("Failed to trigger spec generation task.", error);

    return jsonError(
      500,
      "SPEC_TASK_TRIGGER_FAILED",
      "Failed to start spec generation.",
    );
  }
};
