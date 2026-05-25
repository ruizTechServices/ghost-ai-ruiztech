import "server-only";

import { randomUUID } from "node:crypto";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";
import {
  checkProjectMembership,
  type ProjectMembershipIdentity,
} from "@/lib/supabase/project-membership";

const PROJECT_ARTIFACTS_BUCKET = "project-artifacts";
const SPEC_CONTENT_TYPE = "text/markdown";

type ProjectSpecRow = Database["public"]["Tables"]["project_specs"]["Row"];
type ProjectSpecInsert =
  Database["public"]["Tables"]["project_specs"]["Insert"];

class ProjectSpecAccessError extends Error {
  constructor(message = "Project access is required.") {
    super(message);
    this.name = "ProjectSpecAccessError";
  }
}

class ProjectSpecNotFoundError extends Error {
  constructor(message = "Spec was not found.") {
    super(message);
    this.name = "ProjectSpecNotFoundError";
  }
}

const getProjectSpecPath = ({
  projectId,
  specId,
}: {
  projectId: string;
  specId: string;
}): string => `specs/${projectId}/${specId}.md`;

const ensureProjectSpecAccess = async ({
  identity,
  projectId,
}: {
  identity: ProjectMembershipIdentity;
  projectId: string;
}) => {
  const { access, project } = await checkProjectMembership({
    ...identity,
    projectId,
  });

  if (!access || !project) {
    throw new ProjectSpecAccessError();
  }

  return project;
};

const createProjectSpec = async ({
  identity,
  markdown,
  projectId,
}: {
  identity: ProjectMembershipIdentity;
  markdown: string;
  projectId: string;
}): Promise<ProjectSpecRow> => {
  await ensureProjectSpecAccess({ identity, projectId });

  const supabase = createSupabaseAdminClient();
  const specId = randomUUID();
  const filePath = getProjectSpecPath({ projectId, specId });

  const { error: uploadError } = await supabase.storage
    .from(PROJECT_ARTIFACTS_BUCKET)
    .upload(filePath, markdown, {
      contentType: SPEC_CONTENT_TYPE,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const insert: ProjectSpecInsert = {
    file_path: filePath,
    id: specId,
    project_id: projectId,
  };
  const { data, error: insertError } = await supabase
    .from("project_specs")
    .insert(insert)
    .select("id, project_id, file_path, created_at")
    .single();

  if (insertError) {
    await supabase.storage.from(PROJECT_ARTIFACTS_BUCKET).remove([filePath]);
    throw insertError;
  }

  return data;
};

const getProjectSpecMetadata = async ({
  projectId,
  specId,
}: {
  projectId: string;
  specId: string;
}): Promise<ProjectSpecRow> => {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("project_specs")
    .select("id, project_id, file_path, created_at")
    .eq("id", specId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new ProjectSpecNotFoundError();

  return data;
};

const downloadProjectSpec = async ({
  identity,
  projectId,
  specId,
}: {
  identity: ProjectMembershipIdentity;
  projectId: string;
  specId: string;
}): Promise<{ markdown: string; spec: ProjectSpecRow }> => {
  await ensureProjectSpecAccess({ identity, projectId });

  const spec = await getProjectSpecMetadata({ projectId, specId });
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(PROJECT_ARTIFACTS_BUCKET)
    .download(spec.file_path);

  if (error) throw error;

  return {
    markdown: await data.text(),
    spec,
  };
};

export {
  createProjectSpec,
  downloadProjectSpec,
  getProjectSpecPath,
  PROJECT_ARTIFACTS_BUCKET,
  ProjectSpecAccessError,
  ProjectSpecNotFoundError,
  SPEC_CONTENT_TYPE,
};
export type { ProjectSpecRow };
