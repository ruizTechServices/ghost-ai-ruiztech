const defaultSignInUrl = "/sign-in";
const defaultSignUpUrl = "/sign-up";
const defaultAuthenticatedUrl = "/editor";

const normalizeRoutePath = (url: string) => {
  if (url.startsWith("/")) return url;

  try {
    return new URL(url).pathname;
  } catch {
    return `/${url}`;
  }
};

const clerkSignInUrl =
  process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? defaultSignInUrl;
const clerkSignUpUrl =
  process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? defaultSignUpUrl;
const clerkAuthenticatedUrl =
  process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ??
  process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL ??
  defaultAuthenticatedUrl;

const clerkSignInPath = normalizeRoutePath(clerkSignInUrl);
const clerkSignUpPath = normalizeRoutePath(clerkSignUpUrl);

export {
  clerkAuthenticatedUrl,
  clerkSignInPath,
  clerkSignInUrl,
  clerkSignUpPath,
  clerkSignUpUrl,
};
