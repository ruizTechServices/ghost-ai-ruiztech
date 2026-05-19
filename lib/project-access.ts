import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

import {
  checkProjectMembership,
  type ProjectMembershipResult,
} from "@/lib/supabase/project-membership";

interface ClerkIdentity {
  primaryEmail: string | null;
  userId: string | null;
}

type ProjectAccessResult = ProjectMembershipResult;

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
  return checkProjectMembership({ primaryEmail, projectId: roomId, userId });
};

export { checkProjectAccess, getCurrentClerkIdentity };
export type { ClerkIdentity, ProjectAccessResult };
