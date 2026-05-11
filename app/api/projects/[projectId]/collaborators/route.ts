import { NextResponse } from "next/server";

import {
  addProjectCollaborator,
  listProjectCollaborators,
  normalizeCollaboratorEmail,
  removeProjectCollaborator,
} from "@/lib/project-collaborators";
import {
  checkProjectAccess,
  getCurrentClerkIdentity,
} from "@/lib/project-access";

export const runtime = "nodejs";

interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const projectIdPattern = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

const jsonError = (status: number, code: string, message: string) =>
  NextResponse.json<ApiError>({ error: { code, message } }, { status });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseEmailBody = async (request: Request) => {
  const parsed: unknown = await request.json();

  if (!isRecord(parsed) || typeof parsed.email !== "string") {
    throw new Error("Collaborator email is required.");
  }

  const email = normalizeCollaboratorEmail(parsed.email);

  if (!emailPattern.test(email)) {
    throw new Error("Collaborator email is invalid.");
  }

  return email;
};

const getAuthorizedAccess = async (projectId: string) => {
  const identity = await getCurrentClerkIdentity();

  if (!identity.userId) {
    return { access: null, project: null, status: "unauthenticated" as const };
  }

  const { access, project } = await checkProjectAccess({
    ...identity,
    roomId: projectId,
  });

  return { access, project, status: "authenticated" as const };
};

export const GET = async (
  _request: Request,
  context: RouteContext<"/api/projects/[projectId]/collaborators">,
) => {
  const { projectId } = await context.params;

  if (!projectIdPattern.test(projectId)) {
    return jsonError(400, "INVALID_PROJECT_ID", "Project ID is invalid.");
  }

  try {
    const { access, status } = await getAuthorizedAccess(projectId);

    if (status === "unauthenticated") {
      return jsonError(401, "UNAUTHENTICATED", "Authentication is required.");
    }

    if (!access) {
      return jsonError(403, "FORBIDDEN", "Project access is required.");
    }

    const collaborators = await listProjectCollaborators(projectId);

    return NextResponse.json({
      collaborators,
      canManage: access === "owner",
    });
  } catch {
    return jsonError(
      500,
      "COLLABORATOR_LIST_FAILED",
      "Failed to list collaborators.",
    );
  }
};

export const POST = async (
  request: Request,
  context: RouteContext<"/api/projects/[projectId]/collaborators">,
) => {
  const { projectId } = await context.params;

  if (!projectIdPattern.test(projectId)) {
    return jsonError(400, "INVALID_PROJECT_ID", "Project ID is invalid.");
  }

  let email: string;

  try {
    email = await parseEmailBody(request);
  } catch (error) {
    return jsonError(
      400,
      "INVALID_COLLABORATOR_INPUT",
      error instanceof Error ? error.message : "Invalid collaborator input.",
    );
  }

  try {
    const { access, project, status } = await getAuthorizedAccess(projectId);

    if (status === "unauthenticated") {
      return jsonError(401, "UNAUTHENTICATED", "Authentication is required.");
    }

    if (access !== "owner" || !project) {
      return jsonError(
        403,
        "FORBIDDEN",
        "Only the project owner can manage collaborators.",
      );
    }

    if (email === project.owner_id.toLowerCase()) {
      return jsonError(
        400,
        "INVALID_COLLABORATOR_INPUT",
        "Project owner cannot be added as a collaborator.",
      );
    }

    await addProjectCollaborator({ email, projectId });
    const collaborators = await listProjectCollaborators(projectId);

    return NextResponse.json({ collaborators, canManage: true }, { status: 201 });
  } catch (error) {
    if (isRecord(error) && "code" in error && error.code === "23505") {
      return jsonError(
        409,
        "COLLABORATOR_EXISTS",
        "Collaborator is already invited.",
      );
    }

    return jsonError(
      500,
      "COLLABORATOR_INVITE_FAILED",
      "Failed to invite collaborator.",
    );
  }
};

export const DELETE = async (
  request: Request,
  context: RouteContext<"/api/projects/[projectId]/collaborators">,
) => {
  const { projectId } = await context.params;

  if (!projectIdPattern.test(projectId)) {
    return jsonError(400, "INVALID_PROJECT_ID", "Project ID is invalid.");
  }

  let email: string;

  try {
    email = await parseEmailBody(request);
  } catch (error) {
    return jsonError(
      400,
      "INVALID_COLLABORATOR_INPUT",
      error instanceof Error ? error.message : "Invalid collaborator input.",
    );
  }

  try {
    const { access, status } = await getAuthorizedAccess(projectId);

    if (status === "unauthenticated") {
      return jsonError(401, "UNAUTHENTICATED", "Authentication is required.");
    }

    if (access !== "owner") {
      return jsonError(
        403,
        "FORBIDDEN",
        "Only the project owner can manage collaborators.",
      );
    }

    await removeProjectCollaborator({ email, projectId });
    const collaborators = await listProjectCollaborators(projectId);

    return NextResponse.json({ collaborators, canManage: true });
  } catch {
    return jsonError(
      500,
      "COLLABORATOR_REMOVE_FAILED",
      "Failed to remove collaborator.",
    );
  }
};
