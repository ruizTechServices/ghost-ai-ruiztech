import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { EditorShell } from "@/components/editor/EditorShell";
import { clerkSignInUrl } from "@/lib/auth/clerk-routes";
import type { EditorProject } from "@/lib/editor/get-editor-projects";

interface EditorLayoutProps {
  activeProjectId?: string;
  children: React.ReactNode;
  ownedProjects: EditorProject[];
  sharedProjects: EditorProject[];
}

const EditorLayout = async ({
  activeProjectId,
  children,
  ownedProjects,
  sharedProjects,
}: EditorLayoutProps) => {
  const { isAuthenticated } = await auth();

  if (!isAuthenticated) redirect(clerkSignInUrl);

  return (
    <EditorShell
      activeProjectId={activeProjectId}
      initialOwnedProjects={ownedProjects}
      initialSharedProjects={sharedProjects}
    >
      {children}
    </EditorShell>
  );
};

export { EditorLayout };
