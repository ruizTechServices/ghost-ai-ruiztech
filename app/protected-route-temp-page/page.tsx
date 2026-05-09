import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { clerkAuthenticatedUrl, clerkSignInUrl } from "@/lib/auth/clerk-routes";

export default async function ProtectedRouteTempPage() {
  const { isAuthenticated } = await auth();

  if (!isAuthenticated) redirect(clerkSignInUrl);

  redirect(clerkAuthenticatedUrl);
}
