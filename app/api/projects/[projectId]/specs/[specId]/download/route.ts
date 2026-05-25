import { NextResponse } from "next/server";

import { getCurrentClerkIdentity } from "@/lib/project-access";
import {
  downloadProjectSpec,
  ProjectSpecAccessError,
  ProjectSpecNotFoundError,
  SPEC_CONTENT_TYPE,
} from "@/lib/supabase/project-specs";

export const runtime = "nodejs";

interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

const projectIdPattern = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;
const specIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const jsonError = (status: number, code: string, message: string) =>
  NextResponse.json<ApiError>({ error: { code, message } }, { status });

export const GET = async (
  _request: Request,
  context: RouteContext<"/api/projects/[projectId]/specs/[specId]/download">,
) => {
  const { projectId, specId } = await context.params;

  if (!projectIdPattern.test(projectId)) {
    return jsonError(400, "INVALID_PROJECT_ID", "Project ID is invalid.");
  }

  if (!specIdPattern.test(specId)) {
    return jsonError(400, "INVALID_SPEC_ID", "Spec ID is invalid.");
  }

  const identity = await getCurrentClerkIdentity();

  if (!identity.userId) {
    return jsonError(401, "UNAUTHENTICATED", "Authentication is required.");
  }

  try {
    const { markdown } = await downloadProjectSpec({
      identity,
      projectId,
      specId,
    });

    return new NextResponse(markdown, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${projectId}-${specId}.md"`,
        "Content-Type": `${SPEC_CONTENT_TYPE}; charset=utf-8`,
      },
    });
  } catch (error) {
    if (error instanceof ProjectSpecAccessError) {
      return jsonError(403, "FORBIDDEN", "Project access is required.");
    }

    if (error instanceof ProjectSpecNotFoundError) {
      return jsonError(404, "SPEC_NOT_FOUND", "Spec was not found.");
    }

    console.error("Failed to download project spec.", error);

    return jsonError(
      500,
      "SPEC_DOWNLOAD_FAILED",
      "Failed to download spec.",
    );
  }
};
