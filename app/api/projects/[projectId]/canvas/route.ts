import { NextResponse } from "next/server";

import { parseCanvasSnapshot } from "@/lib/canvas-snapshot";
import { getCurrentClerkIdentity } from "@/lib/project-access";
import {
  CanvasSnapshotAccessError,
  loadCanvasSnapshot,
  saveCanvasSnapshot,
} from "@/lib/supabase/canvas-snapshots";

export const runtime = "nodejs";

interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

const projectIdPattern = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

const jsonError = (status: number, code: string, message: string) =>
  NextResponse.json<ApiError>({ error: { code, message } }, { status });

const readCanvasRequestBody = async (request: Request) => {
  const parsed: unknown = await request.json();

  return parseCanvasSnapshot(parsed);
};

export const GET = async (
  _request: Request,
  context: RouteContext<"/api/projects/[projectId]/canvas">,
) => {
  const { projectId } = await context.params;

  if (!projectIdPattern.test(projectId)) {
    return jsonError(400, "INVALID_PROJECT_ID", "Project ID is invalid.");
  }

  const identity = await getCurrentClerkIdentity();

  if (!identity.userId) {
    return jsonError(401, "UNAUTHENTICATED", "Authentication is required.");
  }

  try {
    const { canvas, path } = await loadCanvasSnapshot({ identity, projectId });

    return NextResponse.json({ canvas, path });
  } catch (error) {
    if (error instanceof CanvasSnapshotAccessError) {
      return jsonError(403, "FORBIDDEN", "Project access is required.");
    }

    return jsonError(
      500,
      "CANVAS_LOAD_FAILED",
      "Failed to load canvas snapshot.",
    );
  }
};

export const PUT = async (
  request: Request,
  context: RouteContext<"/api/projects/[projectId]/canvas">,
) => {
  const { projectId } = await context.params;

  if (!projectIdPattern.test(projectId)) {
    return jsonError(400, "INVALID_PROJECT_ID", "Project ID is invalid.");
  }

  const identity = await getCurrentClerkIdentity();

  if (!identity.userId) {
    return jsonError(401, "UNAUTHENTICATED", "Authentication is required.");
  }

  let canvas: ReturnType<typeof parseCanvasSnapshot>;

  try {
    canvas = await readCanvasRequestBody(request);
  } catch (error) {
    return jsonError(
      400,
      "INVALID_CANVAS_PAYLOAD",
      error instanceof Error ? error.message : "Canvas payload is invalid.",
    );
  }

  try {
    const { path } = await saveCanvasSnapshot({
      canvas,
      identity,
      projectId,
    });

    return NextResponse.json({ path, status: "saved" });
  } catch (error) {
    if (error instanceof CanvasSnapshotAccessError) {
      return jsonError(403, "FORBIDDEN", "Project access is required.");
    }

    return jsonError(
      500,
      "CANVAS_SAVE_FAILED",
      "Failed to save canvas snapshot.",
    );
  }
};
