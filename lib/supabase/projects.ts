import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectDto {
  canvasJsonPath: string | null;
  createdAt: string;
  description: string | null;
  id: string;
  name: string;
  ownerId: string;
  status: ProjectRow["status"];
  updatedAt: string;
}

const projectSelect =
  "id, owner_id, name, description, status, canvas_json_path, created_at, updated_at";

const toProjectDto = (project: ProjectRow): ProjectDto => ({
  canvasJsonPath: project.canvas_json_path,
  createdAt: project.created_at,
  description: project.description,
  id: project.id,
  name: project.name,
  ownerId: project.owner_id,
  status: project.status,
  updatedAt: project.updated_at,
});

const listOwnedProjects = async (ownerId: string) => {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .select(projectSelect)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map(toProjectDto);
};

const createProject = async ({
  id,
  name,
  ownerId,
}: {
  id?: string;
  name: string;
  ownerId: string;
}) => {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({ id, name, owner_id: ownerId })
    .select(projectSelect)
    .single();

  if (error) throw error;

  return toProjectDto(data);
};

const listSharedProjects = async (collaboratorEmail: string) => {
  const supabase = createSupabaseAdminClient();
  const { data: collaboratorRows, error: collaboratorError } = await supabase
    .from("project_collaborators")
    .select("project_id")
    .ilike("collaborator_email", collaboratorEmail);

  if (collaboratorError) throw collaboratorError;

  const projectIds = collaboratorRows.map((row) => row.project_id);

  if (projectIds.length === 0) return [];

  const { data, error } = await supabase
    .from("projects")
    .select(projectSelect)
    .in("id", projectIds)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map(toProjectDto);
};

const getProjectOwnerId = async (projectId: string) => {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .select("owner_id")
    .eq("id", projectId)
    .maybeSingle();

  if (error) throw error;

  return data?.owner_id ?? null;
};

const renameProject = async ({
  name,
  projectId,
}: {
  name: string;
  projectId: string;
}) => {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .update({ name })
    .eq("id", projectId)
    .select(projectSelect)
    .single();

  if (error) throw error;

  return toProjectDto(data);
};

const deleteProject = async (projectId: string) => {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("projects").delete().eq("id", projectId);

  if (error) throw error;
};

export {
  createProject,
  deleteProject,
  getProjectOwnerId,
  listOwnedProjects,
  listSharedProjects,
  renameProject,
};
export type { ProjectDto };
