# Architecture Context

## Stack

| Layer            | Technology              | Role                                                                       |
| ---------------- | ----------------------- | -------------------------------------------------------------------------- |
| Framework        | Next.js 16 + TypeScript | Full-stack app with server/client boundaries                               |
| UI               | Tailwind + shadcn/ui    | Component composition and styling                                          |
| Auth             | Clerk                   | User identity and route protection                                         |
| Database         | Supabase Postgres       | Primary relational database for projects, collaborators, specs, and runs   |
| Object storage   | Supabase Storage        | Canvas snapshots and generated Markdown specs                              |
| Canvas           | Liveblocks + React Flow | Real-time collaborative canvas, presence, and cursors                      |
| Background tasks | Trigger.dev             | Durable AI generation workflows                                            |

## System Boundaries

- `app/api` - Authenticated request handlers: input validation, ownership checks, task triggering, and Supabase persistence.
- `trigger` - Long-running background jobs: AI design generation, spec generation, and Supabase writes that should not block requests.
- `lib/supabase` - Shared Supabase infrastructure: browser client, server client, service-role admin client, typed database helpers, and storage helpers.
- `lib/auth` - Clerk identity helpers and project access control helpers that verify ownership against Supabase records.
- `components` - UI composition: canvas surfaces, sidebars, dialogs, and interactive elements.
- `supabase` - SQL migrations, seed data, generated database types, and local Supabase configuration.
- `data` - Legacy local directory. Do not use it for new project data or generated artifacts.

## Supabase Data Model

Supabase is the system of record for application data. Store relational records in Supabase Postgres and generated files in Supabase Storage.

- **Supabase Postgres** stores project metadata, ownership, collaborator relationships, spec records, task run records, and references to stored artifacts.
- **Supabase Storage** stores generated artifacts, including canvas snapshots at `canvas/{projectId}.json` and specs at `specs/{projectId}/{specId}.md`.
- Project records, spec records, collaborator records, and task run records belong in Supabase tables.
- Canvas content and Markdown output are stored in and retrieved from Supabase Storage.
- Supabase Storage object paths are stored in Supabase Postgres, for example `canvas_json_path` and `file_path`.
- Do not use Prisma, local files, Vercel Blob, Firebase, or another database as the primary persistence layer.

## Access Model

- Every project has a single owner identified by Clerk user ID and stored in Supabase.
- Projects can include additional collaborators stored in a Supabase join table.
- Only authenticated users can access protected routes.
- Only the owner or a collaborator can mutate project resources.
- API routes and background tasks must verify project membership against Supabase before any mutation.
- Liveblocks room tokens are issued only after verifying project membership with Supabase data.

## Starter System Designs

- Prebuilt templates are static canvas snapshots stored in the codebase.
- Templates are loaded into the active Liveblocks room when a user imports one.
- Import can occur on canvas creation or from within the editor at any time.
- Template data follows the same node/edge schema as user-created canvas content.
- Templates do not require a separate Supabase record; they are resolved by template ID at import time.
- When a template is applied to a real project, the resulting canvas snapshot is persisted to Supabase Storage.

## AI Generation Model

### Design Generation

- Input: user prompt, project context, and current canvas state.
- Execution: durable background task via Trigger.dev.
- Output: structured node and edge updates written into the shared Liveblocks room.
- Persistence: the resulting canvas snapshot is saved to Supabase Storage, and its object path is recorded on the project row in Supabase Postgres.

### Spec Generation

- Input: current canvas graph and project context loaded from Supabase-backed project records.
- Execution: durable background task via Trigger.dev.
- Output: Markdown technical spec saved to Supabase Storage.
- Persistence: a spec row is created in Supabase Postgres with the Supabase Storage object path, project ID, creator ID, and task run ID.

## Invariants

1. Supabase is the primary database and persistence boundary for this codebase.
2. Request handlers do not run long-lived AI work; that belongs in background tasks.
3. Relational metadata and generated artifacts are stored in separate Supabase layers: Postgres for records, Storage for files.
4. Auth and ownership are enforced at every mutation boundary with Clerk identity and Supabase project membership data.
5. Client components are used only where browser interactivity or real-time state requires them.
6. The canvas schema must remain consistent between user-created content and imported templates.
