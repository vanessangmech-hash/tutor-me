# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (a `package-lock.json` is also present, but `pnpm-lock.yaml` is the source of truth — recent commits fixed the pnpm lock specifically).

```bash
pnpm install
pnpm dev            # next dev --webpack (default; turbopack has issues here)
pnpm dev:turbo      # next dev --turbopack (opt-in)
pnpm build          # next build
pnpm lint           # eslint .
npx tsc --noEmit    # type-check (build itself ignores TS errors — see next.config.mjs)
```

There is no test runner configured. `npm test` referenced in `SETUP.md` does not exist as a script.

`next.config.mjs` sets `typescript.ignoreBuildErrors: true` — `pnpm build` will succeed even with type errors. Always run `npx tsc --noEmit` before considering type-related work done.

React/React-DOM are pinned to `19.2.4` via both top-level `overrides` and `pnpm.overrides` to prevent duplicate React copies (see commit `c560616` — duplicate React caused an "invalid hook" crash on `/rooms`). Do not loosen these pins.

## Architecture

The repository is **one Next.js app + a separate Deno edge-function backend deployed to InsForge**, plus SQL for two databases.

```
Browser ── Next.js client (app/) ── /api/* (Next route handlers) ── InsForge SDK ── InsForge edge functions (backend/functions/, Deno)
                                                                                            │
                                                                                            ├── InsForge Postgres (core: rooms, personas, members, rewards)
                                                                                            └── Ghost Postgres (conversation_context, topic_embeddings, research_cache)
```

### The proxy pattern (important)

The frontend **never talks to InsForge directly**. All backend calls go through `/api/functions/[fn]/route.ts`, which:

1. Reads the session JWT from the `insforge_session` HTTP-only cookie (`lib/session.ts`).
2. Builds a server-side `@insforge/sdk` client via `lib/insforge-server.ts` using `INSFORGE_BASE_URL` + `INSFORGE_ANON_KEY` (server-only env vars, no `NEXT_PUBLIC_` prefix).
3. Forwards to `client.functions.invoke(fn, { method, body })`.

`lib/api.ts` wraps these calls for the client (e.g. `createRoom`, `joinRoom`, `sendMessage`, `forkPersona`). Add a new backend operation by: (a) writing/extending an edge function in `backend/functions/`, (b) adding a typed wrapper in `lib/api.ts` — no new route file needed; `[fn]` covers any function name.

Realtime is the one exception: `/api/realtime/config` returns `{ baseUrl, anonKey, accessToken }` to authenticated clients so `lib/insforge.ts` can open a direct WebSocket via the InsForge SDK.

### WunderGraph Cosmo (status)

`README.md` describes a WunderGraph Cosmo federation gateway and `backend/graphql/schema.graphql` documents the intended unified schema, but **no Cosmo config or runtime is wired up in this repo** — the actual data path is the REST-style `[fn]` proxy above. Treat the GraphQL schema as a design reference, not the live API surface.

### Backend edge functions (`backend/functions/`)

JavaScript files run on InsForge's Deno runtime (note `import ... from 'npm:@insforge/sdk'` and `Deno.env.get(...)`). They are deployed separately (see `.insforge.json` and `INSFORGE_DEPLOYMENT.md`) — editing them does not affect a local `pnpm dev` session until redeployed.

Functions: `room-manager`, `room-join`, `persona-manager`, `chat-handler`, `learning-adapter`, `reward-handler`, `web-research`. `chat-handler` is the orchestrator — it pulls/updates conversation context in Ghost, optionally calls `web-research` (TinyFish), calls AkashML for completion, detects understanding signals, and may trigger a reward.

### Two databases

- **InsForge Postgres** (`backend/sql/01-insforge-schema.sql`) — core relational tables.
- **Ghost Postgres** (`backend/sql/02-ghost-schema.sql`) — conversation context, vector embeddings, research cache. Edge functions connect to it directly via `GHOST_CONNECTION_STRING` + `postgresjs` (see top of `chat-handler.js`). The Next.js server does not touch Ghost.

Apply migrations in numeric order: `01` → `02` → `03` (realtime channels) → `04` (realtime triggers).

### Classroom (3D + voice)

`components/ClassroomRoot.tsx` mounts a React Three Fiber scene (`components/classroom/`) and overlays chat/voice/notes UI. State is centralized in `lib/useClassroomStore.ts` (Zustand): identity, remote players, messages, persona, whiteboard, voice. A `ClassroomNetwork` interface (`types/classroom.ts`) abstracts the realtime transport — `lib/mockNetwork.ts` is the offline fallback used when no real network is passed in, which keeps the classroom feature self-demoable. VAPI integration lives in `lib/vapi.ts` and uses the public key `NEXT_PUBLIC_VAPI_PUBLIC_KEY`.

### Path alias

`@/*` resolves to repo root (see `tsconfig.json`) — e.g. `@/lib/api`, `@/components/classroom/Room`.

## Environment variables

Two separate envs — do not mix them up:

- **`.env.local`** (Next.js): `INSFORGE_BASE_URL`, `INSFORGE_ANON_KEY` (server-only, no `NEXT_PUBLIC_`), `NEXT_PUBLIC_VAPI_PUBLIC_KEY`.
- **InsForge project / `backend/.env`** (Deno edge functions): `AKASHML_API_KEY`, `GHOST_CONNECTION_STRING`, `INSFORGE_BASE_URL`, `ANON_KEY`, `TINYFISH_BASE_URL`, `TINYFISH_API_KEY`.

Build-time "Missing Insforge env vars" errors are expected on a clean `pnpm build` — env vars are validated at request time inside `getInsforgeServerClient`, not at build. Look above that error for the real failure.
