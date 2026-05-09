import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import {
  clerkSignInPath,
  clerkSignInUrl,
  clerkSignUpPath,
} from "@/lib/auth/clerk-routes";

const isPublicRoute = createRouteMatcher([
  "/",
  `${clerkSignInPath}(.*)`,
  `${clerkSignUpPath}(.*)`,
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect({ unauthenticatedUrl: clerkSignInUrl });
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
