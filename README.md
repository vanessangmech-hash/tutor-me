# TutorMe

An AI-powered tutoring platform where students join interactive classrooms, learn from AI personas, and engage through voice and text — built with a modern federated architecture.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Next.js 16 Frontend (React 19)             │
│        Tailwind CSS · shadcn/ui · Zustand · Three.js        │
│                   VAPI Voice · Framer Motion                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                     API Routes (/api)
                           │
              ┌────────────▼────────────┐
              │   WunderGraph Cosmo     │
              │   Federation Gateway    │
              │                         │
              │   Unified GraphQL API   │
              │   composing subgraphs   │
              │   from Insforge funcs   │
              └─────┬───────────┬───────┘
                    │           │
       ┌────────────▼──┐   ┌───▼──────────────┐
       │   InsForge    │   │   Ghost Database  │
       │   Backend     │   │   (PostgreSQL)    │
       │               │   │                   │
       │  Deno Edge    │   │  Conversation     │
       │  Functions    │   │  context,         │
       │  + Insforge   │   │  embeddings,      │
       │  PostgreSQL   │   │  research cache   │
       └──┬─────┬──────┘   └───────────────────┘
          │     │
    ┌─────▼┐  ┌▼──────────┐
    │AkashML│  │ TinyFish  │
    │ LLM   │  │Web Research│
    └──────┘  └───────────┘
```

### Frontend

- **Next.js 16** with the App Router and **React 19**
- **Tailwind CSS v4** with **shadcn/ui** components (Radix primitives, CVA)
- **Zustand** for classroom state management
- **React Three Fiber** / **Drei** for 3D elements
- **Framer Motion** for animations
- **Recharts** for data visualization
- **VAPI** for real-time voice interactions in the classroom

### Federation Layer — WunderGraph

**WunderGraph Cosmo** serves as the GraphQL federation gateway, unifying the InsForge backend and Ghost database into a single composed API. Each InsForge edge function is exposed as a federated GraphQL subgraph (room-manager, persona-manager, chat-handler, learning-adapter, reward-handler, auth-handler), and Cosmo handles cross-subgraph resolution, query batching, caching, and auth context propagation — eliminating the N+1 request problem that a traditional REST proxy would face.

### Backend — InsForge

**InsForge** is the primary backend-as-a-service powering TutorMe:

- **Deno Edge Functions** — Serverless functions for room management, persona management, chat handling, learning adaptation, rewards, web research, and authentication
- **InsForge PostgreSQL** — Relational store for rooms, personas, messages, members, rewards, and user profiles
- **InsForge Auth** — JWT-based authentication with session management
- **InsForge Realtime** — WebSocket channels with database triggers for live classroom updates

### Ghost Database

A dedicated **PostgreSQL** instance (referred to as "Ghost") stores conversation context, vector embeddings, and web research cache — keeping the AI memory layer separate from the core application data.

### External Services

| Service | Role |
|---------|------|
| **AkashML** | LLM inference for AI tutor personas |
| **TinyFish** | Web research API (search, fetch, async runs) for grounding tutor responses in real-world information |
| **VAPI** | Voice AI SDK enabling spoken conversations with tutor personas |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

Key variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_INSFORGE_URL` | InsForge project URL |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | InsForge anonymous key |
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | VAPI public key for voice |
| `AKASHML_API_KEY` | AkashML API key (edge functions) |
| `GHOST_CONNECTION_STRING` | Ghost PostgreSQL connection string |
| `TINYFISH_BASE_URL` | TinyFish API base URL |
| `TINYFISH_API_KEY` | TinyFish API key |

### Run Locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Database Setup

Apply the SQL migrations in order:

1. `backend/sql/01-insforge-schema.sql` — Core application tables
2. `backend/sql/02-ghost-schema.sql` — Conversation context and embeddings
3. `backend/sql/03-realtime-channels.sql` — Realtime channel configuration
4. `backend/sql/04-realtime-triggers.sql` — Database triggers for live updates

See `SETUP.md` and `INSFORGE_DEPLOYMENT.md` for detailed deployment instructions.

## Acknowledgements

This project would not be possible without the incredible tools and platforms we build on:

- **[WunderGraph](https://wundergraph.com/)** — For Cosmo and GraphQL federation that unified our fragmented backend into a single, elegant API gateway. Their approach to composing subgraphs transformed our architecture.
- **[InsForge](https://insforge.dev/)** — For providing the backend-as-a-service foundation: edge functions, PostgreSQL, auth, and realtime — all in one platform that let us move fast without managing infrastructure.
- **[Ghost](https://ghost.org/)** — For inspiring the dedicated context database layer that gives our AI tutors persistent memory and grounded, contextual responses.
- **[VAPI](https://vapi.ai/)** — For making voice AI accessible and enabling students to have natural spoken conversations with their AI tutors.
- **[TinyFish](https://tinyfish.ai/)** — For powering the web research capability that keeps tutor responses accurate and up-to-date with real-world information.
- **[Akash Network](https://akash.network/)** — For AkashML and decentralized GPU infrastructure that powers the LLM inference behind our AI tutor personas.

Thank you all for building tools that make projects like TutorMe possible.

## License

This project is licensed under the [MIT License](LICENSE).
