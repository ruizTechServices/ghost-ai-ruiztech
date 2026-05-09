# Ghost AI RuizTech

## Overview

Ghost AI RuizTech is a real-time collaborative system design workspace. Users authenticate with Clerk, describe a system in plain English, an AI agent maps that system onto a shared canvas, collaborators refine the architecture, and the app generates a technical specification from the resulting graph.

Supabase is the main database and persistence platform for the codebase. Supabase Postgres stores relational application data, and Supabase Storage stores generated canvas and spec artifacts.

## Goals

1. Let Clerk-authenticated users create and manage architecture projects.
2. Provide a collaborative real-time canvas for system design.
3. Let users import prebuilt starter system designs into the canvas.
4. Let AI generate an initial architecture from a natural language prompt.
5. Let collaborators refine the generated architecture.
6. Convert the final graph into a Markdown technical spec persisted through Supabase.

## Core User Flow

1. User signs in with Clerk.
2. User creates or selects a project stored in Supabase Postgres.
3. User enters the project workspace after Supabase-backed ownership or collaborator access is verified.
4. User optionally imports a starter system design template into the canvas.
5. User prompts the AI to generate or extend the system design.
6. AI generates nodes and edges in the shared canvas.
7. Collaborators edit and refine the design.
8. Canvas snapshots are persisted to Supabase Storage and referenced from Supabase Postgres.
9. User triggers spec generation.
10. App persists the generated Markdown spec to Supabase Storage and records its metadata in Supabase Postgres.
11. User reviews or downloads the spec.

## Features

### Authentication and Projects

- Clerk user sign-in and route protection.
- Project creation, ownership, and collaborator access stored in Supabase Postgres.
- Project list and workspace navigation backed by Supabase queries.
- Clerk user IDs are stored on Supabase records for ownership and access checks.

### Collaborative Canvas

- Shared real-time canvas using Liveblocks and React Flow.
- Live cursors, presence indicators, and node/edge editing.
- Canvas snapshots persisted to Supabase Storage.
- Supabase Postgres stores the current canvas snapshot path for each project.

### Starter System Designs

- A curated library of prebuilt system design templates.
- Users can import a starter template into the canvas at any point during editing.
- Templates are static canvas snapshots loaded directly into the active room.
- Imported template results are persisted through the same Supabase Storage snapshot flow as user-created canvas content.
- Covers common patterns: monolith, microservices, event-driven, serverless, and more.

### AI Architecture Generation

- AI generates a system design from a user-supplied prompt.
- Output is structured as canvas nodes and edges written into the shared room.
- Generation runs as a durable background task.
- Task metadata and generated artifact references are recorded in Supabase.

### Spec Generation

- The current canvas graph is converted into a Markdown technical specification.
- Specs are persisted to Supabase Storage.
- Supabase Postgres stores spec metadata, project ownership, storage path, and generation task references.
- Users can view and download generated specs.

## Scope

### In Scope

- Clerk authentication and route protection
- Supabase Postgres project creation and ownership
- Collaborator access by project through Supabase records
- Starter system design template library and import
- Real-time shared canvas with nodes, edges, and presence
- AI-powered architecture generation from prompts
- AI-powered Markdown spec generation from the canvas graph
- Supabase-backed persistent storage for project metadata and generated artifacts
- Spec download from Supabase Storage

### Out Of Scope

- Billing and subscription systems
- Enterprise permission tiers beyond owner and collaborator
- Versioned spec history and review workflows
- Replacing Clerk auth with Supabase Auth
- Replacing Supabase as the primary database or artifact storage platform
- Mobile-native applications

## Success Criteria

1. A Clerk-signed-in user can create and open a Supabase-backed project.
2. Multiple authorized users can collaborate in the same canvas simultaneously.
3. A user can import a prebuilt starter design into the canvas.
4. AI can generate an architecture into the shared room from a prompt.
5. The graph can be converted into a Markdown spec persisted in Supabase Storage.
6. Project metadata, access records, task records, and artifact paths are stored in Supabase Postgres.
