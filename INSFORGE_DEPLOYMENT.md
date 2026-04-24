# Insforge Backend Deployment Guide

## 📋 Prerequisites

1. Insforge account with a project created
2. Insforge CLI installed: `npm install -g @insforge/cli`
3. Backend env vars configured in Insforge project settings
4. GitHub connection set up in Insforge dashboard

---

## 🔑 Step 1: Get Your Insforge Credentials

1. Go to [Insforge Dashboard](https://insforge.io)
2. Create a new project or select existing one
3. Go to **Settings → API Keys**
4. Copy your **API Key** (you'll need this)
5. Note your **Project ID** (visible in project settings)

---

## 🔐 Step 2: Configure Backend Environment Variables

In Insforge dashboard, go to your project → **Settings → Environment Variables**

Add these variables:

```env
# Chat & AI
AKASHML_API_KEY=your_akashml_api_key_here

# Database (PostgreSQL for conversation context)
GHOST_CONNECTION_STRING=postgresql://username:password@host:port/database

# Insforge config (for edge functions to call each other)
INSFORGE_BASE_URL=https://e64sbexr.us-west.insforge.app
ANON_KEY=your_insforge_anon_key_here

# Web Research
TINYFISH_BASE_URL=https://api.tinyfish.ai/v1
TINYFISH_API_KEY=your_tinyfish_api_key_here
```

---

## 📦 Step 3: Deploy Functions to Insforge

### Option A: Using Insforge CLI (Manual)

```bash
# Login to Insforge
insforge login

# Set your project context
insforge projects:list  # Find your project ID
insforge projects:use <PROJECT_ID>

# Deploy all backend functions
insforge functions:deploy backend/functions/
```

### Option B: Using Git Push to Deploy (Recommended)

1. **Connect GitHub repo to Insforge:**
   - Go to project → **Settings → Deployments**
   - Click **Connect GitHub**
   - Authorize and select `vanessangmech-hash/tutor-me`
   - Select branch: `main`

2. **Configure deploy settings:**
   - Functions directory: `backend/functions/`
   - Runtime: `deno`

3. **Deploy:**
   - Push to GitHub: `git push origin main`
   - Insforge auto-deploys the functions

### Option C: Docker Deployment

```bash
# Build Docker image with functions
docker build -f backend/Dockerfile -t tutor-me-backend .

# Push to Insforge registry
docker tag tutor-me-backend insforge.io/your-org/tutor-me-backend
docker push insforge.io/your-org/tutor-me-backend

# Deploy via CLI
insforge functions:deploy --image insforge.io/your-org/tutor-me-backend
```

---

## ✅ Step 4: Verify Deployment

### Check Function Status
```bash
insforge functions:list
```

Expected output:
```
✓ chat-handler
✓ persona-manager
✓ room-manager
✓ room-join
✓ learning-adapter
✓ reward-handler
✓ web-research
```

### Test a Function
```bash
insforge functions:invoke chat-handler \
  --data '{"room_id":"test","message":"Hello"}'
```

### View Logs
```bash
insforge functions:logs chat-handler --follow
```

---

## 🔗 Step 5: Connect Frontend to Deployed Backend

Your frontend API routes are already configured to call these Insforge functions via proxy at `/api/functions/[fn]`.

**Verify in `.env.local`:**
```env
INSFORGE_BASE_URL=https://your-insforge-instance.com
INSFORGE_ANON_KEY=your_key_here
```

The frontend will automatically route all calls through the next.js `/api/functions/` endpoint, which proxies to your deployed Insforge functions.

---

## 📊 Function Overview

| Function | Purpose | Dependencies |
|----------|---------|--------------|
| **chat-handler** | Chat completions + context | AkashML, Ghost DB, Insforge |
| **persona-manager** | Create/read/update personas | Insforge database |
| **room-manager** | Room CRUD operations | Insforge database |
| **room-join** | Join/leave room logic | Insforge database |
| **learning-adapter** | Analyze learning style | Insforge database |
| **reward-handler** | Award badges/points | Insforge database |
| **web-research** | Search web via TinyFish | TinyFish API, Insforge |

---

## 🐛 Troubleshooting

### "Invalid API Key"
```bash
insforge login --api-key your_actual_key
```

### "Function deployment failed"
1. Check function syntax: `deno check backend/functions/chat-handler.js`
2. Verify env vars are set in Insforge dashboard
3. Check logs: `insforge functions:logs <function-name>`

### "Environment variables not found"
1. Go to project → Settings → Environment Variables
2. Ensure all vars from [Step 2](#-step-2-configure-backend-environment-variables) are set
3. Redeploy: `insforge functions:deploy backend/functions/`

### "Database connection error"
- Verify `GHOST_CONNECTION_STRING` is correct
- Check database is accessible from Insforge IPs
- Test connection locally first

### "AkashML API key invalid"
- Verify key in Insforge env vars
- Test key locally: `curl -H "Authorization: Bearer $AKASHML_API_KEY" https://api.akashml.com/v1/chat/completions`

---

## 📈 Monitoring & Logs

### Real-time Logs
```bash
insforge functions:logs chat-handler --follow
```

### View Function Metrics
```bash
insforge functions:metrics chat-handler
```

### Check Database Connections
```bash
psql $GHOST_CONNECTION_STRING -c "SELECT COUNT(*) FROM conversation_context;"
```

---

## 🚨 Production Checklist

- [ ] All env vars configured in Insforge dashboard
- [ ] Functions deployed and tested
- [ ] Database backups enabled
- [ ] API rate limits configured
- [ ] Error logging/monitoring set up
- [ ] Frontend `.env.local` points to correct Insforge URL
- [ ] HTTPS enabled for all connections
- [ ] Session token expiry set (30 days default)

---

## 🔄 Update Deployment

### To update a function after code changes:

**Option A: Auto-deploy via GitHub**
```bash
git commit -am "Update chat-handler logic"
git push origin main
# Insforge auto-deploys within 2-3 minutes
```

**Option B: Manual CLI deploy**
```bash
insforge functions:deploy backend/functions/chat-handler.js
```

**Option C: Redeploy all**
```bash
insforge functions:deploy backend/functions/
```

---

## 📚 Useful Commands

```bash
# List all projects
insforge projects:list

# Switch project context
insforge projects:use <PROJECT_ID>

# Deploy functions
insforge functions:deploy <path>

# Invoke function (test)
insforge functions:invoke <function-name> --data '{...}'

# View logs
insforge functions:logs <function-name> --follow

# Get function info
insforge functions:info <function-name>

# Delete function
insforge functions:delete <function-name>

# List environment variables
insforge env:list

# Set environment variable
insforge env:set KEY=value

# Delete environment variable
insforge env:delete KEY
```

---

## 🔗 Resources

- [Insforge Documentation](https://docs.insforge.io)
- [Deno Runtime Docs](https://deno.land/manual)
- [AkashML API](https://akashml.com)
- [TinyFish API](https://tinyfish.ai)
- [GitHub Repo](https://github.com/vanessangmech-hash/tutor-me)

---

**Last Updated:** April 24, 2026
