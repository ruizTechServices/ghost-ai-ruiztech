import { SignIn } from "@clerk/nextjs";

import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { clerkAuthenticatedUrl, clerkSignUpUrl } from "@/lib/auth/clerk-routes";

export default function SignInPage() {
  return (
    <AuthPageShell mode="sign-in">
      <SignIn
        fallbackRedirectUrl={clerkAuthenticatedUrl}
        signUpUrl={clerkSignUpUrl}
      />
    </AuthPageShell>
  );
}
