import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  deleteProject,
  getProjectOwnerId,
  renameProject,
} from "@/lib/supabase/projects";

export const runtime = "nodejs";

interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

const projectIdPattern =
  /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

const jsonError = (status: number, code: string, message: string) =>
  NextResponse.json<ApiError>({ error: { code, message } }, { status });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readJsonObject = async (request: Request) => {
  const body = await request.text();

  if (body.trim().length === 0) {
    throw new Error("Request body is required.");
  }

  const parsed: unknown = JSON.parse(body);

  if (!isRecord(parsed)) {
    throw new Error("Request body must be a JSON object.");
  }

  return parsed;
};

const parseRenameProjectBody = async (request: Request) => {
  const body = await readJsonObject(request);
  const rawName = body.name;

  if (typeof rawName !== "string" || rawName.trim().length === 0) {
    throw new Error("Project name is required.");
  }

  return { name: rawName.trim() };
};

const authorizeOwner = async ({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}) => {
  const ownerId = await getProjectOwnerId(projectId);

  return ownerId === userId;
};

export const PATCH = async (
  request: Request,
  context: RouteContext<"/api/projects/[projectId]">,
) => {
  const { userId } = await auth();

  if (!userId) {
    return jsonError(401, "UNAUTHENTICATED", "Authentication is required.");
  }

  const { projectId } = await context.params;

  if (!projectIdPattern.test(projectId)) {
    return jsonError(400, "INVALID_PROJECT_ID", "Project ID is invalid.");
  }

  let name: string;

  try {
    ({ name } = await parseRenameProjectBody(request));
  } catch (error) {
    return jsonError(
      400,
      "INVALID_PROJECT_INPUT",
      error instanceof Error ? error.message : "Invalid project input.",
    );
  }

  try {
    const isOwner = await authorizeOwner({ projectId, userId });

    if (!isOwner) {
      return jsonError(
        403,
        "FORBIDDEN",
        "Only the project owner can mutate this project.",
      );
    }

    const project = await renameProject({ name, projectId });

    return NextResponse.json({ project });
  } catch {
    return jsonError(500, "PROJECT_RENAME_FAILED", "Failed to rename project.");
  }
};

export const DELETE = async (
  _request: Request,
  context: RouteContext<"/api/projects/[projectId]">,
) => {
  const { userId } = await auth();

  if (!userId) {
    return jsonError(401, "UNAUTHENTICATED", "Authentication is required.");
  }

  const { projectId } = await context.params;

  if (!projectIdPattern.test(projectId)) {
    return jsonError(400, "INVALID_PROJECT_ID", "Project ID is invalid.");
  }

  try {
    const isOwner = await authorizeOwner({ projectId, userId });

    if (!isOwner) {
      return jsonError(
        403,
        "FORBIDDEN",
        "Only the project owner can mutate this project.",
      );
    }

    await deleteProject(projectId);

    return NextResponse.json({ projectId });
  } catch {
    return jsonError(500, "PROJECT_DELETE_FAILED", "Failed to delete project.");
  }
};
