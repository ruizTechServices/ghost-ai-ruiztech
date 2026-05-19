import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectMembershipIdentity {
  primaryEmail: string | null;
  userId: string | null;
}

interface ProjectMembershipResult {
  access: "owner" | "collaborator" | null;
  project: ProjectRow | null;
}

const projectSelect =
  "id, owner_id, name, description, status, canvas_json_path, created_at, updated_at";

const checkProjectMembership = async ({
  primaryEmail,
  projectId,
  userId,
}: ProjectMembershipIdentity & {
  projectId: string;
}): Promise<ProjectMembershipResult> => {
  if (!userId) return { access: null, project: null };

  const supabase = createSupabaseAdminClient();
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(projectSelect)
    .eq("id", projectId)
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
    .eq("project_id", projectId)
    .ilike("collaborator_email", primaryEmail)
    .maybeSingle();

  if (collaboratorError) throw collaboratorError;

  return {
    access: collaborator ? "collaborator" : null,
    project,
  };
};

export { checkProjectMembership, projectSelect };
export type { ProjectMembershipIdentity, ProjectMembershipResult };
