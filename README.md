# Ghost AI RuizTech

Ghost AI RuizTech is a Next.js App Router workspace for collaborative system design. Clerk handles authentication, while Supabase is the main database and persistence platform.

## Core Stack

- Next.js 16 and TypeScript for the application framework.
- Clerk for authentication, user sessions, and protected routes.
- Supabase Postgres for projects, collaborators, generated spec metadata, task runs, and artifact references.
- Supabase Storage for canvas snapshots and generated Markdown specs.
- Liveblocks and React Flow for real-time collaborative canvas editing.
- Trigger.dev for durable AI generation workflows.

## Supabase Role

Supabase is the source of truth for application persistence.

- Store relational records in Supabase Postgres.
- Store generated files in Supabase Storage.
- Store Clerk user IDs on Supabase rows for ownership and collaborator checks.
- Use Supabase Row Level Security where client-side data access is required.
- Do not add Prisma, Vercel Blob, Firebase, local JSON files, or another primary database/storage layer for application data.

## Environment

Create `.env.local` with Clerk, Supabase, Liveblocks, OpenAI, and Trigger.dev values:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

LIVEBLOCKS_SECRET_KEY=your_liveblocks_secret_key

OPENAI_API_KEY=your_openai_api_key

TRIGGER_SECRET_KEY=your_trigger_secret_key
```

Use service-role, OpenAI, and Trigger secret keys only in server-only code paths.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Development Notes

- Keep Clerk as the auth provider.
- Use Supabase Postgres for project data, access records, task records, and generated spec metadata.
- Use Supabase Storage for canvas snapshots and generated Markdown specs.
- Verify Supabase-backed project ownership before issuing Liveblocks room tokens or mutating project resources.
- Trigger design-generation work through `POST /api/ai/design` and issue short-lived run-scoped realtime tokens through `POST /api/ai/design/token`.
- OpenAI API access is centralized under `lib/openai` and must stay server-only.
- Follow the context files in `context/` before implementing new subsystems.
