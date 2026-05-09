# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Clerk auth entry flow implemented; visual approval pending

## Current Goal

- Confirm the Clerk sign-in/sign-up and editor entry flow visually with Gio, then move to the next implementation unit while keeping Clerk and Supabase architecture decisions intact.

## Completed

- Clerk is documented as the authentication provider.
- Supabase Postgres is documented as the primary relational database.
- Supabase Storage is documented as the artifact storage layer for canvas snapshots and generated specs.
- shadcn/ui is installed and configured with CSS variables.
- Requested UI primitives are generated in `components/ui/`: button, card, dialog, input, badge, alert, tooltip, dropdown-menu, tabs, accordion, textarea, scroll-area, select, checkbox, and radio-group.
- `lucide-react` is installed for project icons.
- `lib/utils.ts` provides the shadcn `cn()` helper.
- `app/globals.css` defines the dark Ghost AI theme tokens and maps them to Tailwind/shadcn tokens.
- The root layout applies dark mode and wraps the app in `TooltipProvider`.
- `components/editor/Navbar.tsx` provides the fixed-height editor top bar with logo, sidebar toggle, search, help, notifications, theme toggle control, and user profile dropdown.
- `components/editor/Sidebar.tsx` provides the floating slide-in editor sidebar with Projects and Shared tabs, empty states, close control, and New Project dialog trigger.
- `components/editor/EditorLayout.tsx` gates the editor shell behind Clerk server auth, and `components/editor/EditorShell.tsx` mounts the navbar and sidebar with shared sidebar state.
- The editor dialog pattern is documented in `context/ui-context.md` using the existing shadcn dialog primitives for title, description, and footer actions.
- Gio visually reviewed the mounted editor chrome and approved it.
- `app/protected-route-temp-page/page.tsx` is protected with Clerk middleware route matching and server-side `auth()` gating.
- Editor chrome is no longer mounted globally from `app/layout.tsx`; protected editor chrome from `context/feature-spec/02-editor.md` is enabled from the Clerk-protected temp route.
- `app/page.tsx` remains a public homepage and has been redesigned with existing shadcn `Card` components while preserving the homepage title and product description copy in a side-by-side hero layout.
- `components/editor/Navbar.tsx` now uses Clerk's official `UserButton` instead of the custom profile dropdown, delegating profile, account switching, logout, security, connected accounts, preferences, and billing/account-management UI to Clerk.
- `proxy.ts` protects `app/protected-route-temp-page/page.tsx` and future `/project` and `/projects` route families with Clerk `auth.protect()`.
- `@clerk/ui` is installed so Clerk's `dark` theme from `@clerk/ui/themes` can be used as the auth UI base.
- `app/layout.tsx` wraps the app in `ClerkProvider` with Clerk dark theme and app CSS-variable appearance overrides.
- `app/sign-in/[[...sign-in]]/page.tsx` and `app/sign-up/[[...sign-up]]/page.tsx` provide minimal Clerk auth pages with a two-panel desktop layout and form-only mobile layout.
- `app/page.tsx` is now an auth-state redirect entrypoint: authenticated users redirect to `/editor`, unauthenticated users redirect to the Clerk sign-in URL.
- Clerk sign-out now redirects directly to the configured sign-in URL instead of first hitting `/`.
- `app/editor/page.tsx` is the protected editor entry route and renders the protected editor shell.
- `lib/auth/clerk-routes.ts` centralizes Clerk sign-in, sign-up, and fallback redirect URLs using standard Clerk env vars with local path fallbacks.
- `proxy.ts` now protects all routes by default except `/`, the configured sign-in path, and the configured sign-up path.

## In Progress

- Supabase implementation has not been added yet; docs define the intended database and storage architecture.
- Clerk auth flow visual review by Gio is pending; leave the final visual checkbox in `context/feature-spec/03-auth-correction.md` unchecked until approval.

## Next Up

- Add Supabase dependencies, environment helpers, typed clients, migrations, and storage bucket setup.

## Open Questions

- Exact Supabase table schema and Row Level Security policies need to be finalized before implementation.

## Architecture Decisions

- Clerk remains the auth provider. Supabase Auth will not replace Clerk.
- Supabase is the main persistence layer because the app needs relational project data, collaboration access records, task run records, and generated artifact storage in one platform.

## Session Notes

- All new database and storage code should target Supabase, not Prisma, Vercel Blob, local files, Firebase, or another primary persistence tool.
- 2026-05-09: Implemented `context/feature-spec/01-design-system.md`. Verified with `npm run lint` and `npm run build`.
- 2026-05-09: Implemented the reusable editor navbar and floating sidebar shell from `context/feature-spec/02-editor.md`. Verified with `npm run lint` and `npm run build`; visual approval remains pending.
- 2026-05-09: Mounted the editor navbar and sidebar in `components/editor/EditorLayout.tsx` and applied it from `app/layout.tsx`.
- 2026-05-09: Gio visually approved the mounted editor chrome; marked `context/feature-spec/02-editor.md` complete.
- 2026-05-09: Protected `app/protected-route-temp-page/page.tsx` using Clerk `clerkMiddleware()`, `createRouteMatcher()`, `auth.protect()`, and server-side `auth()` redirect gating.
- 2026-05-09: Initially kept the editor navbar global and moved the sidebar/dialog chrome behind the protected route via `components/editor/ProtectedEditorChrome.tsx`; later auth correction removed global editor chrome entirely.
- 2026-05-09: Redesigned the public homepage with current shadcn card components and kept the existing homepage copy in a side-by-side hero layout.
- 2026-05-09: Implemented `context/feature-spec/03-auth-correction.md` by removing global editor chrome from `app/layout.tsx`, protecting `components/editor/EditorLayout.tsx` with Clerk server auth, replacing the custom navbar profile dropdown with Clerk `UserButton`, and expanding `proxy.ts` protection for temporary and future project routes.
- 2026-05-09: Verified the auth correction with `npm run lint` and `npm run build`; visual approval remains pending.
- 2026-05-09: Implemented the `## REVIEW THIS ONE NOW!!!` auth spec by installing `@clerk/ui`, applying Clerk's dark theme through `ClerkProvider`, adding Clerk sign-in/sign-up pages, adding `/editor`, changing `/` to an auth-state redirect, and making `proxy.ts` protect all non-auth routes by default.
- 2026-05-09: Re-verified the Clerk auth entry flow with `npm run lint` and `npm run build`; visual approval remains pending.
- 2026-05-09: Fixed sign-out redirect behavior by sending Clerk sign-out directly to the configured sign-in URL, avoiding the `/` to `/sign-in` redirect hop.
