# ShehriAwaz (شہری آواز) — Pakistan Civic Reporting Platform

> **"Citizen Voice"** — report civic problems, track the responsible department, and follow neighborhood issues across Pakistani cities.

ShehriAwaz lets citizens file civic complaints (garbage, water, roads, electricity, and more) with a photo and optional description. AI classifies the issue, assigns the responsible public authority (WASA, LESCO, LWMC, TMA, etc.), and the platform tracks resolution status — alongside a live civic-news digest and a citizen assistant chatbot.

## ✨ Features

- **📸 Report civic issues** — upload a photo + description, pick your city and area
- **🤖 AI classification** — Google Gemini analyzes the report, detects category/severity, and names the exact responsible department (with a rule-based fallback when no key is configured)
- **🗺️ Neighborhood feed** — browse issues by city, area, and category with live status stamps (Reported → In Progress → Resolved)
- **💬 "Ask ShehriAwaz" assistant** — a civic-rights chatbot that explains which authority handles a problem and how to file an official complaint
- **📰 Civic News Digest** — live Pakistan news filtered for civic relevance (News API + Pakistani RSS feeds + Gemini editor), cached in Postgres daily
- **👤 Citizen accounts** — Supabase Auth (email/password) with profiles; instant signup for instant demos
- **📊 My Reports** — track the status of everything you've reported

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, Lucide icons, Framer Motion |
| Backend | Express (Node.js ESM), TypeScript |
| Database | Supabase Postgres (connection pooler) |
| Auth | Supabase Auth (email/password) |
| AI | Google Gemini (`gemini-3.7-flash`) via `@google/genai` |
| News | News API + Pakistani RSS feeds |
| Hosting | Vercel (serverless functions) |

## 🏗 Architecture

```
┌────────────────────────────┐        ┌──────────────────────────────┐
│  Vite React SPA (browser)  │ ─────▶ │  Vercel Serverless Function  │
│  src/  · VITE_* env vars   │  /api  │  api/index.ts → app.ts       │
└────────────────────────────┘        └──────────────┬───────────────┘
        │ supabase-js (anon key)                      │ pg (pooler)
        ▼                                              ▼
┌────────────────────────────┐        ┌──────────────────────────────┐
│   Supabase Auth + REST     │        │   Supabase Postgres          │
│   (signup / login / RLS)   │        │   profiles · issues ·        │
└────────────────────────────┘        │   news_cache                 │
                                      └──────────────────────────────┘
```

- The SPA talks to Supabase directly for **auth** and to the Express server for **/api** endpoints (issues CRUD, AI, news, photo upload).
- On Vercel, `api/index.ts` is the serverless entry; the Express app runs fully inside it.
- Locally, Vite middleware serves the SPA while the same Express app runs the API on one port.

## 📁 Project Structure

```
├── api/index.ts            # Vercel serverless entry (imports ../app.js)
├── app.ts                  # Express app — all /api routes
├── server/db.ts            # Postgres pool, schema init, RLS, queries
├── src/
│   ├── App.tsx             # App shell + routing
│   ├── lib/supabase.ts     # Supabase client, auth, issues, uploads
│   ├── components/         # AuthModal, IssueCard, NewsUpdates, ChatAssistant, …
│   ├── pages/              # Home, CivicIssues, …
│   ├── data/               # Seed issues, Pakistan cities
│   └── types.ts            # Shared TS types
├── vite.config.ts
├── vercel.json
└── .env.example            # All environment variables (empty template)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (database + auth)
- A [Vercel](https://vercel.com) account
- Optional: a Google AI Studio / Gemini API key, a [News API](https://newsapi.org) key

### 1. Environment variables

```bash
cp .env.example .env
```

| Variable | Required | Used for |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL (`https://<ref>.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Public client key (safe to be public — RLS protects data) |
| `DATABASE_URL` | ✅ | Postgres **pooler** connection string (port 6543) |
| `DIRECT_URL` | ⬜ | Fallback direct Postgres connection (port 5432) |
| `GEMINI_API_KEY` | ⬜ | AI classification + chat + news editor (falls back to heuristics) |
| `NEWS_API_KEY` | ⬜ | Live news feed (falls back to RSS + verified bulletins) |
| `SUPABASE_SERVICE_ROLE_KEY` | ⬜ | Server-only auto-confirm of emails (see Security) |

> Never commit `.env`. Only `VITE_*` variables reach the browser.

### 2. Supabase setup

The Postgres schema (`profiles`, `issues`, `news_cache` tables + RLS policies) is **created automatically** on first `/api/*` call. Recommended manual step:

- **Authentication → Sign In / Providers → Email** → turn **OFF** *"Confirm email"* so citizens can sign up and log in instantly (ideal for demos and hackathons).

### 3. Install & run

```bash
npm install
npm run dev        # Express + Vite dev server → http://localhost:3000
```

### 4. Quality & build

```bash
npm run lint       # TypeScript type check (tsc --noEmit)
npm run build      # Production build (vite build → dist/)
```

## 🌐 Deploying to Vercel

1. Push the repo to GitHub and import it in Vercel.
2. Add the environment variables above under **Settings → Environment Variables** (apply to Production).
3. Deploy — `api/index.ts` is picked up automatically as the serverless entry (see `vercel.json`).

After deploy, hit `https://<your-app>.vercel.app/api/health` once so the database schema initializes; it reports `geminiConfigured`, `autoConfirmConfigured`, and database status.

## 📡 API Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/auth/confirm-signup` | Server-side email auto-confirm (uses service role key) |
| `GET` | `/api/issues` | List/filter civic issues (`?city=&area=&category=&userId=`) |
| `POST` | `/api/issues` | Create a civic issue report |
| `PATCH` | `/api/issues/:id/status` | Update issue status |
| `POST` | `/api/classify-issue` | AI classification of a photo/description |
| `POST` | `/api/chat` | "Ask ShehriAwaz" assistant |
| `GET` | `/api/news` | Daily civic news digest (DB-cached) |
| `POST` | `/api/upload-photo` | Photo upload (base64) |
| `GET` | `/api/health` | Health, AI/db configuration status |
| `GET` | `/api/db-status` | Postgres connectivity + stats |

## 🔒 Security Notes

- **Row-Level Security (RLS)** protects your Postgres data. The public anon key is safe to ship in the client *only because* RLS governs access.
- **Never** expose the `service_role` key (or `DATABASE_URL`) to the client — server env only.
- Environment values are gitignored (`.env*`, with `!.env.example`); **rotate any secret that ever appears in git history**.
- This is a hackathon/demo project — status updates are intentionally open for demonstration. In production, restrict status changes to authorized department/admin accounts.

## 📜 License

MIT — use it freely. Built for the community.
