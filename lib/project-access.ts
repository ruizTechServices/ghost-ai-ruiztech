import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

interface ClerkIdentity {
  primaryEmail: string | null;
  userId: string | null;
}

interface ProjectAccessResult {
  access: "owner" | "collaborator" | null;
  project: ProjectRow | null;
}

const projectSelect =
  "id, owner_id, name, description, status, canvas_json_path, created_at, updated_at";

const getCurrentClerkIdentity = async (): Promise<ClerkIdentity> => {
  const [{ userId }, user] = await Promise.all([auth(), currentUser()]);

  return {
    primaryEmail:
      user?.primaryEmailAddress?.emailAddress ??
      user?.emailAddresses.at(0)?.emailAddress ??
      null,
    userId,
  };
};

const checkProjectAccess = async ({
  primaryEmail,
  roomId,
  userId,
}: ClerkIdentity & {
  roomId: string;
}): Promise<ProjectAccessResult> => {
  if (!userId) return { access: null, project: null };

  const supabase = createSupabaseAdminClient();
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(projectSelect)
    .eq("id", roomId)
    .maybeSingle();

  if (projectError) throw projectError;
  if (!project) return { access: null, project: null };

  if (project.owner_id === userId) {
    return { access: "owner", project };
  }

  if (!primaryEmail) return { access: null, project };

  const { data: collaborator, error: collaboratorError } = await supabase
    .from("project_collaborators")
    .select("project_id")
    .eq("project_id", roomId)
    .ilike("collaborator_email", primaryEmail)
    .maybeSingle();

  if (collaboratorError) throw collaboratorError;

  return {
    access: collaborator ? "collaborator" : null,
    project,
  };
};

export { checkProjectAccess, getCurrentClerkIdentity };
export type { ClerkIdentity, ProjectAccessResult };
