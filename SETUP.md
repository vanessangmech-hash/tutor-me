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

**Vercel (Recommended - Step by step):**
```bash
# Add environment variables
vercel env add INSFORGE_BASE_URL
# Enter: https://e64sbexr.us-west.insforge.app

vercel env add INSFORGE_ANON_KEY
# Enter: your_insforge_anon_key

vercel env add NEXT_PUBLIC_VAPI_PUBLIC_KEY
# Enter: your_vapi_public_key

# Deploy to production
vercel deploy --prod
```

Or set them in Vercel dashboard: Project → Settings → Environment Variables

**Railway:**
```
INSFORGE_BASE_URL=https://e64sbexr.us-west.insforge.app
INSFORGE_ANON_KEY=your_insforge_anon_key
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
```

**Important:** 
- `INSFORGE_BASE_URL` and `INSFORGE_ANON_KEY` are **server-side only** (never exposed to browser)
- `NEXT_PUBLIC_VAPI_PUBLIC_KEY` is safe to expose (public VAPI key only)

### 5. Test Deployment

After deployment:

1. Visit your production URL
2. Sign up with test account
3. Create a tutor room
4. Test chat with AkashML backend
5. Test voice with VAPI

---

## 🏗️ Build & Testing

### Test Local Build (Required before deployment)
```bash
npm run build
```

This builds the application exactly as Vercel will. If it succeeds locally, it will succeed on Vercel.

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

### Troubleshooting Build Failures

**"Missing Insforge env vars" error during build:**
- This is expected! Build phase doesn't need credentials
- Env vars are checked at runtime (in API routes)
- If build still fails, check TypeScript errors above the env var error

**Solution:**
```bash
# Clean build cache and retry
rm -rf .next
npm run build
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

### Build Fails with "Missing Insforge env vars"
**Why:** This is expected during build. Env vars are only checked at runtime.
**Fix:** 
```bash
rm -rf .next && npm run build
```
If it still fails, check for TypeScript errors above the env var error.

### "Missing Insforge environment variables" at Runtime
- Check `.env.local` has `INSFORGE_BASE_URL` and `INSFORGE_ANON_KEY`
- Verify credentials are correct in Insforge dashboard
- On Vercel: Check Settings → Environment Variables for both vars

### "Unauthorized" errors on API calls
- Session cookie may have expired
- Try logging out and back in
- Check browser dev tools → Application → Cookies for `insforge_session`
- On Vercel: Ensure `INSFORGE_BASE_URL` and `INSFORGE_ANON_KEY` are set

### Chat not working
- Verify `AKASHML_API_KEY` is set in Insforge backend
- Check AkashML API status: `curl https://api.akashml.com/v1/chat/completions`
- Review Insforge function logs: `insforge functions:logs chat-handler --follow`

### Voice not working
- Verify `NEXT_PUBLIC_VAPI_PUBLIC_KEY` in `.env.local`
- On Vercel: Check it's set in Environment Variables
- Test VAPI connection in browser console: `fetch('/api/realtime/config')`

### Vercel Deployment Fails
1. Run `npm run build` locally to catch issues first
2. Add all env vars to Vercel dashboard (Settings → Environment Variables):
   - `INSFORGE_BASE_URL`
   - `INSFORGE_ANON_KEY`
   - `NEXT_PUBLIC_VAPI_PUBLIC_KEY`
3. Redeploy: `vercel deploy --prod`
4. Check Vercel build logs for specific errors

---

## 📖 Useful Links

- [Insforge Dashboard](https://insforge.io)
- [AkashML API](https://akashml.com)
- [VAPI Docs](https://vapi.ai/docs)
- [Next.js Docs](https://nextjs.org)
- [GitHub Repo](https://github.com/vanessangmech-hash/tutor-me)

---

**Last Updated:** April 24, 2026
