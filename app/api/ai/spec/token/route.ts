import { auth as triggerAuth } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";

import { checkProjectAccess, getCurrentClerkIdentity } from "@/lib/project-access";
import {
  getTaskRunForUser,
  TASK_TYPE_SPEC_GENERATION,
} from "@/lib/supabase/task-runs";
import { GENERATE_SPEC_TASK_ID } from "@/lib/trigger/generate-spec";

export const runtime = "nodejs";

interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

interface TokenRequestBody {
  runId?: unknown;
}

const jsonError = (status: number, code: string, message: string) =>
  NextResponse.json<ApiError>({ error: { code, message } }, { status });

const readRequestBody = async (
  request: Request,
): Promise<TokenRequestBody | null> => {
  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  return body as TokenRequestBody;
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

  if (typeof body.runId !== "string" || body.runId.trim().length === 0) {
    return jsonError(400, "INVALID_RUN_ID", "Run ID is required.");
  }

  const runId = body.runId.trim();

  try {
    const taskRun = await getTaskRunForUser({
      runId,
      userId: identity.userId,
    });

    if (!taskRun) {
      return jsonError(403, "FORBIDDEN", "Run access is required.");
    }

    if (taskRun.task_type !== TASK_TYPE_SPEC_GENERATION) {
      return jsonError(400, "INVALID_RUN_TYPE", "Run type is invalid.");
    }

    const { access } = await checkProjectAccess({
      ...identity,
      roomId: taskRun.project_id,
    });

    if (!access) {
      return jsonError(403, "FORBIDDEN", "Project access is required.");
    }

    const token = await triggerAuth.createPublicToken({
      expirationTime: "1h",
      scopes: {
        read: {
          runs: [taskRun.run_id],
          tasks: [GENERATE_SPEC_TASK_ID],
        },
      },
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Failed to create spec generation public token.", error);

    return jsonError(
      500,
      "SPEC_TOKEN_FAILED",
      "Failed to create spec run token.",
    );
  }
};
