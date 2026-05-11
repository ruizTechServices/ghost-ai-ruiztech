import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { createProject, listOwnedProjects } from "@/lib/supabase/projects";

export const runtime = "nodejs";

const untitledProjectName = "Untitled Project";
const projectIdPattern =
  /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

const jsonError = (status: number, code: string, message: string) =>
  NextResponse.json<ApiError>({ error: { code, message } }, { status });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readJsonObject = async (request: Request) => {
  const body = await request.text();

  if (body.trim().length === 0) return {};

  const parsed: unknown = JSON.parse(body);

  if (!isRecord(parsed)) {
    throw new Error("Request body must be a JSON object.");
  }

  return parsed;
};

const parseCreateProjectBody = async (request: Request) => {
  const body = await readJsonObject(request);
  const rawName = body.name;
  const rawProjectId = body.projectId;

  if (
    rawProjectId !== undefined &&
    (typeof rawProjectId !== "string" || !projectIdPattern.test(rawProjectId))
  ) {
    throw new Error("Project ID is invalid.");
  }

  if (rawName === undefined) {
    return { id: rawProjectId, name: untitledProjectName };
  }

  if (typeof rawName !== "string") {
    throw new Error("Project name must be a string.");
  }

  const name = rawName.trim();

  return { id: rawProjectId, name: name.length > 0 ? name : untitledProjectName };
};

export const GET = async () => {
  const { userId } = await auth();

  if (!userId) {
    return jsonError(401, "UNAUTHENTICATED", "Authentication is required.");
  }

  try {
    const projects = await listOwnedProjects(userId);

    return NextResponse.json({ projects });
  } catch {
    return jsonError(500, "PROJECT_LIST_FAILED", "Failed to list projects.");
  }
};

export const POST = async (request: Request) => {
  const { userId } = await auth();

  if (!userId) {
    return jsonError(401, "UNAUTHENTICATED", "Authentication is required.");
  }

  let id: string | undefined;
  let name: string;

  try {
    ({ id, name } = await parseCreateProjectBody(request));
  } catch (error) {
    return jsonError(
      400,
      "INVALID_PROJECT_INPUT",
      error instanceof Error ? error.message : "Invalid project input.",
    );
  }

  try {
    const project = await createProject({ id, name, ownerId: userId });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (
      isRecord(error) &&
      "code" in error &&
      error.code === "23505"
    ) {
      return jsonError(
        409,
        "PROJECT_ID_CONFLICT",
        "A project with this ID already exists.",
      );
    }

    return jsonError(500, "PROJECT_CREATE_FAILED", "Failed to create project.");
  }
};
