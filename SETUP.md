# TutorMe - Setup & Deployment Guide

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### 1. Clone and Install

```bash
git clone https://github.com/vanessangmech-hash/tutor-me.git
cd tutor-me
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update `.env.local` with your credentials:

```env
# Insforge Backend (server-side only)
INSFORGE_BASE_URL=https://e64sbexr.us-west.insforge.app
INSFORGE_ANON_KEY=your_actual_insforge_anon_key_here

# VAPI Voice AI (public, safe to expose)
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Backend (Insforge Edge Functions)

The backend functions are deployed separately in Insforge:
- Create `.env` file in `backend/` directory
- Set environment variables:

```env
AKASHML_API_KEY=your_akashml_api_key_here
GHOST_CONNECTION_STRING=postgresql://user:password@host:port/database
INSFORGE_BASE_URL=https://e64sbexr.us-west.insforge.app
ANON_KEY=your_insforge_anon_key_here
TINYFISH_BASE_URL=https://api.tinyfish.ai/v1
TINYFISH_API_KEY=your_tinyfish_api_key_here
```

---

## 🔐 Security Architecture

### Frontend (Next.js Client)
- ✅ No sensitive credentials exposed
- ✅ All API calls proxied through Next.js API routes
- ✅ Session stored in HTTP-only cookies
- ✅ Only `NEXT_PUBLIC_VAPI_PUBLIC_KEY` is public

### Backend (Next.js API Routes)
- ✅ Insforge credentials server-side only (`INSFORGE_BASE_URL`, `INSFORGE_ANON_KEY`)
- ✅ Validates user session before proxying to backend
- ✅ HTTP-only cookies prevent XSS token theft
- ✅ Realtime config endpoint auth-gated

### Edge Functions (Insforge)
- Handles chat, persona management, web research, rewards
- Uses AkashML for chat completions
- Connects to Ghost (PostgreSQL) for conversation context
- Integrates with TinyFish for web research

---

## 📦 Deployment with Insforge MCP

### 1. Install Insforge MCP in Claude Code

In Claude Code settings, add the Insforge MCP connector:

```json
{
  "mcpServers": {
    "insforge": {
      "command": "npx",
      "args": ["@insforge/mcp"],
      "env": {
        "INSFORGE_BASE_URL": "https://e64sbexr.us-west.insforge.app",
        "INSFORGE_API_KEY": "your_insforge_api_key"
      }
    }
  }
}
```

Or use the skills menu: `/setup-cowork` → Select Insforge connector.

### 2. Deploy Backend Functions

Using Insforge MCP in Claude Code:

```bash
# Option A: Manual deployment via Insforge CLI
npx @insforge/cli deploy backend/functions --project-id=your_project_id

# Option B: Using Claude Code with Insforge MCP
# Ask Claude: "Deploy the backend functions to Insforge using the MCP"
```

Backend functions to deploy:
- `backend/functions/chat-handler.js` — Chat completions + context management
- `backend/functions/persona-manager.js` — Persona CRUD
- `backend/functions/room-manager.js` — Room management
- `backend/functions/room-join.js` — Room join/leave
- `backend/functions/learning-adapter.js` — Learning style detection
- `backend/functions/reward-handler.js` — Reward system
- `backend/functions/web-research.js` — Web research via TinyFish

### 3. Deploy Frontend (Next.js)

Options:

**A. Vercel (Recommended)**
```bash
npm i -g vercel
vercel login
vercel deploy
```

**B. Railway**
```bash
npm i -g railway
railway login
railway link
railway up
```

**C. Docker (Any Host)**
```bash
docker build -t tutor-me .
docker run -p 3000:3000 \
  -e INSFORGE_BASE_URL=... \
  -e INSFORGE_ANON_KEY=... \
  -e NEXT_PUBLIC_VAPI_PUBLIC_KEY=... \
  tutor-me
```

### 4. Configure Production Environment

Set production env vars in your deployment platform:

**Vercel:**
```bash
vercel env add INSFORGE_BASE_URL
vercel env add INSFORGE_ANON_KEY
vercel env add NEXT_PUBLIC_VAPI_PUBLIC_KEY
```

**Railway:**
```
INSFORGE_BASE_URL=...
INSFORGE_ANON_KEY=...
NEXT_PUBLIC_VAPI_PUBLIC_KEY=...
```

### 5. Test Deployment

After deployment:

1. Visit your production URL
2. Sign up with test account
3. Create a tutor room
4. Test chat with AkashML backend
5. Test voice with VAPI

---

## 🧪 Development Testing

### Run Tests
```bash
npm test
```

### Check Types
```bash
npx tsc --noEmit
```

### Lint
```bash
npm run lint
```

---

## 📚 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React Frontend (Next.js Client)                       │ │
│  │  - No sensitive credentials                            │ │
│  │  - VAPI voice integration                              │ │
│  │  - Realtime chat with WebSocket                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↕ (HTTP)
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS API ROUTES (Server)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ /api/auth/* — Login, Signup, Logout                   │ │
│  │ /api/functions/[fn] — Proxy to Insforge functions     │ │
│  │ /api/realtime/config — Realtime WebSocket config      │ │
│  │                                                         │ │
│  │ Session validation via HTTP-only cookies               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↕ (HTTPS)
┌─────────────────────────────────────────────────────────────┐
│           INSFORGE BACKEND (Edge Functions)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ chat-handler.js — Chat + context (uses AkashML)       │ │
│  │ persona-manager.js — Persona CRUD                      │ │
│  │ room-manager.js — Room management                      │ │
│  │ learning-adapter.js — Detect learning style            │ │
│  │ reward-handler.js — Award badges/points                │ │
│  │ web-research.js — Search the web (TinyFish)            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↕ (API)
┌─────────────────────────────────────────────────────────────┐
│                 EXTERNAL SERVICES                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ AkashML (LLM) — meta-llama/llama-3.3-70b-instruct    │   │
│  │ TinyFish (Search) — Web research API                  │   │
│  │ VAPI (Voice) — Voice transcription & synthesis        │   │
│  │ Ghost (DB) — PostgreSQL conversation context          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### "Missing Insforge environment variables"
- Check `.env.local` has `INSFORGE_BASE_URL` and `INSFORGE_ANON_KEY`
- Verify credentials are correct in Insforge dashboard

### "Unauthorized" errors on API calls
- Session cookie may have expired
- Try logging out and back in
- Check browser dev tools → Application → Cookies for `insforge_session`

### Chat not working
- Verify `AKASHML_API_KEY` is set in Insforge backend
- Check AkashML API status
- Review Insforge function logs

### Voice not working
- Verify `NEXT_PUBLIC_VAPI_PUBLIC_KEY` in env
- Test VAPI connection in browser console

---

## 📖 Useful Links

- [Insforge Dashboard](https://insforge.io)
- [AkashML API](https://akashml.com)
- [VAPI Docs](https://vapi.ai/docs)
- [Next.js Docs](https://nextjs.org)
- [GitHub Repo](https://github.com/vanessangmech-hash/tutor-me)

---

**Last Updated:** April 24, 2026
