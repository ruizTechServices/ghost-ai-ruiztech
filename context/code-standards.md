# Code Standards

## General

- Keep modules small and single-purpose.
- Fix root causes; do not layer workarounds.
- Do not mix unrelated concerns in one component or route.
- Respect the system boundaries defined in `architecture.md`.
- Supabase is the primary database and storage platform for this project.

## TypeScript

- Strict mode is required throughout the project.
- Avoid `any`; use explicit interfaces or narrowly scoped types.
- Validate unknown external input at system boundaries before trusting it.
- Use `interface` for object contracts.
- Prefer generated Supabase database types for table rows, inserts, updates, RPC arguments, and query responses.

## Next.js

- Default to React Server Components.
- Add `"use client"` only when the component needs browser interactivity, hooks, or real-time state.
- Keep route handlers focused on a single responsibility.
- Long-running work belongs in background tasks, not in request handlers.
- Server-side Supabase reads and writes must use server-only helpers from `lib/supabase`.

## Styling

- Use CSS custom property tokens defined in `globals.css`; no raw Tailwind color classes like `zinc-*` or hardcoded hex values.
- Reference tokens through their Tailwind utility names: `bg-base`, `text-copy-primary`, `border-surface-border`, `text-brand`, etc.
- Maintain the border radius scale: `rounded-xl` for small elements, `rounded-2xl` for cards, `rounded-3xl` for modals.

## API Routes

- Validate and parse request input before any logic runs.
- Enforce Clerk auth and Supabase project ownership checks before any mutation.
- Return consistent, predictable response shapes.
- Keep route handlers thin; push complexity into shared modules or background tasks.
- Never trust a project ID, spec ID, room ID, or task run ID until it has been verified against Supabase records for the authenticated user.

## Supabase Data and Storage

- Project metadata and relationships belong in Supabase Postgres.
- Canvas snapshots and generated specs belong in Supabase Storage.
- Store Supabase Storage object paths in Supabase Postgres; do not store large generated content directly in relational columns.
- Task run records are first-class relational data in Supabase Postgres. Treat ownership and run IDs as verified only after a Supabase lookup.
- Use Supabase Row Level Security for user-scoped data where direct client access is required.
- Use server-side Supabase clients for privileged operations and service-role clients only in server-only code paths.
- Do not introduce Prisma, Vercel Blob, Firebase, SQLite, MongoDB, local JSON files, or another primary database/storage layer for application persistence.

## File Organization

- `lib/supabase/` - Supabase clients, typed query helpers, storage helpers, and database utilities.
- `lib/auth/` - Clerk auth helpers and Supabase-backed authorization checks.
- `supabase/` - SQL migrations, seed files, local config, and generated database types.
- `trigger/` - all durable background tasks and AI workflows.
- `components/` - UI composition only; no business logic.
- `app/api/` - route handlers for auth, triggering, and Supabase persistence.
- Name files after the responsibility they contain, not the technology, except shared infrastructure directories like `lib/supabase`.
