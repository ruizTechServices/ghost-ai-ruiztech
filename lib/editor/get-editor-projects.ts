import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { clerkSignInUrl } from "@/lib/auth/clerk-routes";
import {
  listOwnedProjects,
  listSharedProjects,
  type ProjectDto,
} from "@/lib/supabase/projects";

interface EditorProject extends ProjectDto {
  ownership: "owned" | "shared";
}

interface EditorProjectLists {
  ownedProjects: EditorProject[];
  sharedProjects: EditorProject[];
}

const getPrimaryEmail = async () => {
  const user = await currentUser();

  return (
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses.at(0)?.emailAddress ??
    null
  );
};

const getEditorProjects = async (): Promise<EditorProjectLists> => {
  const { userId } = await auth();

  if (!userId) redirect(clerkSignInUrl);

  const collaboratorEmail = await getPrimaryEmail();
  const [ownedProjects, sharedProjects] = await Promise.all([
    listOwnedProjects(userId),
    collaboratorEmail ? listSharedProjects(collaboratorEmail) : [],
  ]);

  return {
    ownedProjects: ownedProjects.map((project) => ({
      ...project,
      ownership: "owned",
    })),
    sharedProjects: sharedProjects.map((project) => ({
      ...project,
      ownership: "shared",
    })),
  };
};

export { getEditorProjects };
export type { EditorProject };
