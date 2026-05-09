import { SignUp } from "@clerk/nextjs";

import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { clerkAuthenticatedUrl, clerkSignInUrl } from "@/lib/auth/clerk-routes";

export default function SignUpPage() {
  return (
    <AuthPageShell mode="sign-up">
      <SignUp
        fallbackRedirectUrl={clerkAuthenticatedUrl}
        signInUrl={clerkSignInUrl}
      />
    </AuthPageShell>
  );
}
