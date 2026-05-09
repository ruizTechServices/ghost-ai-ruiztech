Read `Agents.md before starting.

Legend:
- {profile-button} = `<button type="button" tabindex="0" data-slot="dropdown-menu-trigger" aria-label="Open user profile menu" aria-haspopup="menu" id="base-ui-_R_1tnlb_" class="group/button inline-flex shrink-0 items-center justify-center border bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 [&amp;_svg:not([class*='size-'])]:size-4 hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 h-8 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 gap-2 rounded-xl border-surface-border bg-bg-subtle/70 px-2" aria-expanded="false"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-user h-5 w-5 text-brand" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path></svg><span class="hidden max-w-24 truncate text-sm sm:inline">Profile</span></button>`

Fix the auth flow that is currently broken.
 - the {profile-button} button should be the official Clerk auth button
 - the Clerk auth button should be used in place of the current,{profile-button}, custom auth button
 - Clerk should handle the auth flow completely
 - Users should not be able to access protected pages without logging in
 - put the implemented editor components behind protected routes
 - make sure the auth flow is seamless and secure
 - protected routes and components are:
   - components\editor\EditorLayout.tsx
   - components\editor\Navbar.tsx
   - components\editor\Sidebar.tsx
   - any future `\project` components
   - any future `\project` routes 
   - `app\protected-route-temp-page\page.tsx`
### check when done

- [x] auth flow is fixed
- [x] auth flow uses Clerk auth button
- [x] auth flow uses Clerk user profile menu
- [x] auth flow uses Clerk user profile menu for logout
- [x] auth flow uses Clerk user profile menu for switching accounts
- [x] auth flow uses Clerk user profile menu for viewing user info
- [x] auth flow uses Clerk user profile menu for editing user info
- [x] auth flow uses Clerk user profile menu for managing subscriptions
- [x] auth flow uses Clerk user profile menu for managing payment methods
- [x] auth flow uses Clerk user profile menu for managing security settings
- [x] auth flow uses Clerk user profile menu for managing connected accounts
- [x] auth flow uses Clerk user profile menu for managing notifications
- [x] auth flow uses Clerk user profile menu for managing preferences
- [x] auth flow delegates account management to Clerk
- [x] auth flow is secure
- [x] auth flow is seamless
- [x] auth flow redirects to home page when logging out from a protected page
- [x] protected routes appear as links in the navbar when user is logged in
- [x] protected routes are not accessible when user is not logged in
- [x] no lint errors
- [ ] no visual errors based on user testing(ask Gio how it looks and if he says it looks good, then mark this as complete)


## REVIEW THIS ONE NOW!!! 

Clerk is already installed and connected. Wire it into the Next.js app: provider, auth pages, redirects, route protection, and user menu.

## Design

Use Clerk’s `dark` theme from `@clerk/ui/themes` as the base.

Override Clerk appearance variables using the app’s existing CSS variables. Do not hardcode colors.

### Sign-in and sign-up pages:

- large screens: simple two-panel layout
- left: compact logo, tagline, short text-only feature list
- right: centered Clerk form
- small screens: form only
- no gradients
- no oversized hero sections
- no feature cards
- no scroll-heavy layouts

Keep the layout minimal and professional.

## Implementation

Wrap the root layout with `ClerkProvider` using Clerk’s `dark` theme.

Create sign-in and sign-up pages using Clerk components.

Use `proxy.ts` at the project root, not `middleware.ts`.

Define public routes using the existing sign-in and sign-up env vars. Protect everything else by default.

Update `/`:

- authenticated users redirect to `/editor`
- unauthenticated users redirect to `/sign-in`

Add Clerk’s built-in `UserButton` to the editor navbar right section for profile settings and logout.

Keep Clerk’s default user menu and profile flows intact. Do not rebuild or heavily customize Clerk internals.

Use existing Clerk env vars. Do not rename or invent new ones.

## Dependencies

install: @clerk/ui.

## Check When Done

- [x] `proxy.ts` exists at the root
- [x] all routes are protected except public auth paths
- [x] auth pages use CSS variables with no hardcoded colors
- [x] `ClerkProvider` wraps the root layout
- [x] `npm run build` passes
