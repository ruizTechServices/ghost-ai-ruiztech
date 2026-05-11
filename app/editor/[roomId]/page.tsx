import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/editor/access-denied";
import { WorkspaceShell } from "@/components/editor/WorkspaceShell";
import { clerkSignInUrl } from "@/lib/auth/clerk-routes";
import { getEditorProjects, type EditorProject } from "@/lib/editor/get-editor-projects";
import {
  checkProjectAccess,
  getCurrentClerkIdentity,
} from "@/lib/project-access";

export default async function EditorRoomPage(
  props: PageProps<"/editor/[roomId]">,
) {
  const { roomId } = await props.params;
  const identity = await getCurrentClerkIdentity();

  if (!identity.userId) redirect(clerkSignInUrl);

  const [{ access, project }, { ownedProjects, sharedProjects }] =
    await Promise.all([
      checkProjectAccess({ ...identity, roomId }),
      getEditorProjects(),
    ]);

  if (!project || !access) return <AccessDenied />;

  const currentProject: EditorProject = {
    canvasJsonPath: project.canvas_json_path,
    createdAt: project.created_at,
    description: project.description,
    id: project.id,
    name: project.name,
    ownerId: project.owner_id,
    ownership: access === "owner" ? "owned" : "shared",
    status: project.status,
    updatedAt: project.updated_at,
  };

  return (
    <WorkspaceShell
      ownedProjects={ownedProjects}
      project={currentProject}
      roomId={roomId}
      sharedProjects={sharedProjects}
    />
  );
}
