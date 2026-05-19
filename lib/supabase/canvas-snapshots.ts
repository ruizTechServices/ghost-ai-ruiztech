import "server-only";

import {
  parseCanvasSnapshot,
  type CanvasSnapshot,
} from "@/lib/canvas-snapshot";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  checkProjectMembership,
  type ProjectMembershipIdentity,
} from "@/lib/supabase/project-membership";

const CANVAS_SNAPSHOT_BUCKET = "project-artifacts";

class CanvasSnapshotAccessError extends Error {
  constructor(message = "Project access is required.") {
    super(message);
    this.name = "CanvasSnapshotAccessError";
  }
}

const getCanvasSnapshotPath = (projectId: string): string =>
  `canvas/${projectId}.json`;

const ensureCanvasAccess = async ({
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
    throw new CanvasSnapshotAccessError();
  }

  return project;
};

const saveCanvasSnapshot = async ({
  canvas,
  identity,
  projectId,
}: {
  canvas: CanvasSnapshot;
  identity: ProjectMembershipIdentity;
  projectId: string;
}): Promise<{ path: string }> => {
  await ensureCanvasAccess({ identity, projectId });

  const supabase = createSupabaseAdminClient();
  const path = getCanvasSnapshotPath(projectId);
  const { error: uploadError } = await supabase.storage
    .from(CANVAS_SNAPSHOT_BUCKET)
    .upload(path, JSON.stringify(canvas), {
      contentType: "application/json",
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { error: updateError } = await supabase
    .from("projects")
    .update({ canvas_json_path: path })
    .eq("id", projectId);

  if (updateError) throw updateError;

  return { path };
};

const loadCanvasSnapshot = async ({
  identity,
  projectId,
}: {
  identity: ProjectMembershipIdentity;
  projectId: string;
}): Promise<{ canvas: CanvasSnapshot | null; path: string | null }> => {
  const project = await ensureCanvasAccess({ identity, projectId });
  const path = project.canvas_json_path;

  if (!path) return { canvas: null, path: null };

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(CANVAS_SNAPSHOT_BUCKET)
    .download(path);

  if (error) throw error;

  const parsed: unknown = JSON.parse(await data.text());

  return {
    canvas: parseCanvasSnapshot(parsed),
    path,
  };
};

export {
  CANVAS_SNAPSHOT_BUCKET,
  CanvasSnapshotAccessError,
  getCanvasSnapshotPath,
  loadCanvasSnapshot,
  saveCanvasSnapshot,
};
