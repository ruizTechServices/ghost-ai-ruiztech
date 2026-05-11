import "server-only";

import { clerkClient } from "@clerk/nextjs/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

interface Collaborator {
  avatarUrl: string | null;
  createdAt: string;
  displayName: string | null;
  email: string;
}

interface CollaboratorRow {
  collaborator_email: string;
  created_at: string;
}

const normalizeCollaboratorEmail = (email: string) =>
  email.trim().toLowerCase();

const listProjectCollaboratorRows = async (projectId: string) => {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("project_collaborators")
    .select("collaborator_email, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data;
};

const enrichCollaboratorRows = async (
  rows: CollaboratorRow[],
): Promise<Collaborator[]> => {
  const emails = rows.map((row) => normalizeCollaboratorEmail(row.collaborator_email));

  if (emails.length === 0) return [];

  const client = await clerkClient();
  const users = await client.users.getUserList({
    emailAddress: emails,
    limit: emails.length,
  });
  const usersByEmail = new Map(
    users.data.flatMap((user) =>
      user.emailAddresses.map((emailAddress) => [
        emailAddress.emailAddress.toLowerCase(),
        user,
      ] as const),
    ),
  );

  return rows.map((row) => {
    const email = normalizeCollaboratorEmail(row.collaborator_email);
    const user = usersByEmail.get(email);

    return {
      avatarUrl: user?.imageUrl ?? null,
      createdAt: row.created_at,
      displayName: user?.fullName ?? null,
      email,
    };
  });
};

const listProjectCollaborators = async (projectId: string) => {
  const rows = await listProjectCollaboratorRows(projectId);

  return enrichCollaboratorRows(rows);
};

const addProjectCollaborator = async ({
  email,
  projectId,
}: {
  email: string;
  projectId: string;
}) => {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("project_collaborators").insert({
    collaborator_email: normalizeCollaboratorEmail(email),
    project_id: projectId,
  });

  if (error) throw error;
};

const removeProjectCollaborator = async ({
  email,
  projectId,
}: {
  email: string;
  projectId: string;
}) => {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("project_collaborators")
    .delete()
    .eq("project_id", projectId)
    .ilike("collaborator_email", normalizeCollaboratorEmail(email));

  if (error) throw error;
};

export {
  addProjectCollaborator,
  listProjectCollaborators,
  normalizeCollaboratorEmail,
  removeProjectCollaborator,
};
export type { Collaborator };
