# 🛣️ RoadWatch — AI-Powered Road Transparency Platform

> IIT Madras COERS Hackathon 2026 · Problem Statement 1.2

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env       # Edit .env with your API keys
npm install
npm run dev                # Starts on http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                # Starts on http://localhost:5173
```

### 3. Open the app

Visit **http://localhost:5173**

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@roadwatch.demo | demo1234 |
| Engineer (West Bengal) | engineer.abc@roadwatch.demo | demo1234 |
| Engineer (Tamil Nadu) | engineer.xyz@roadwatch.demo | demo1234 |

**Citizens** — no login required. Just open the app.

## Demo Complaint Tokens

| Token | Status |
|---|---|
| RW-2026-XJKP | InProgress |
| RW-2026-MNBV | Submitted |
| RW-2026-QWER | Resolved |
| RW-2026-TYUI | Escalated |

---

## AI Chatbot Setup

Add your Anthropic API key to `backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

Without a key, the chatbot shows a fallback message. All other features work fully.

---

## Architecture

```
frontend/    React 18 + Vite + TypeScript + Tailwind CSS
             Leaflet.js maps · Recharts analytics
             Zustand + TanStack Query · PWA (Workbox)

backend/     Node.js + Express
             In-memory data store (demo) · JWT auth
             Claude API chatbot · Scoring engine
```

## Features Implemented

- ✅ Interactive map with road markers (colour-coded by condition)
- ✅ Road detail page: contractor, budget, repair history, engineer contact
- ✅ Anonymous complaint filing with tracking token
- ✅ Complaint tracker by token with SLA status
- ✅ Complaint routing engine (NH → NHAI, SH → PWD, etc.)
- ✅ Engineer dashboard: inbox, status updates, citizen replies
- ✅ Admin dashboard: all complaints, reassignment, escalation, contractor scores
- ✅ Contractor scoring: 5-component algorithmic score
- ✅ Public analytics: charts, budget utilisation, leaderboard
- ✅ AI chatbot (Claude API) with live road data context injection
- ✅ PWA: installable, offline indicator, service worker caching
- ✅ Seed data: 7 roads, 3 contractors, 6 complaints (WB + TN)

## Deployment

### Frontend → Vercel
```bash
cd frontend && npm run build
# Deploy dist/ to Vercel
```

### Backend → Railway / Render
```bash
# Set env vars in Railway dashboard
# Start command: node src/index.js
```
