import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { EditorShell } from "@/components/editor/EditorShell";
import { clerkSignInUrl } from "@/lib/auth/clerk-routes";

interface EditorLayoutProps {
  children: React.ReactNode;
}

const EditorLayout = async ({ children }: EditorLayoutProps) => {
  const { isAuthenticated } = await auth();

  if (!isAuthenticated) redirect(clerkSignInUrl);

  return <EditorShell>{children}</EditorShell>;
};

export { EditorLayout };
