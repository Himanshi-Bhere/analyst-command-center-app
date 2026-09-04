# Analyst Command Center

> **Retail • E-Commerce • Commercial • BFSI Analytics Career OS** — a personal operating system that turns a 9-month analytics job-search plan into ranked daily tasks, evidence-based skill progression, project pipelines and an application tracker. Built for a 2027 analytics graduate. Works offline, installs on phone, no backend.

## What it does

| Area | Highlights |
|---|---|
| **Priority engine** | "What should I do next?" is computed live: interview > application deadline > project deadline > weakest readiness gap > scheduled learning. Every task carries a *why*. |
| **Roadmap → daily tasks** | 16-week curriculum (SQL → Excel → Power BI/DAX → Stats → Python → domain → 3 flagship projects) auto-expanded into a 7-day cadence: Learn → Guided → Business problems → Interview Qs → Timed drill → Mini-project → Revision + test. Auto-switches to **Job Search Mode** after week 16. |
| **Evidence-based skill tree** | Skills reach *Interview Ready* only through gates (e.g. SQL: 10 concepts + 50 problems + 10 business + 5 interview + mini-project + timed test + verbal explain). Watching a course never counts. |
| **Readiness score 0–100** | Weighted: SQL 20 · Power BI 15 · Projects 15 · Excel 10 · Stats 10 · Python 10 · Domain 10 · Aptitude 5 · Interview 5, with a full "why is my score X?" breakdown and domain-level readiness for E-Com / BFSI / Commercial. |
| **Projects** | 3 portfolio projects (E-Commerce Checkout Intelligence · BFSI Credit Risk & Fraud · Commercial Revenue Command Center) tracked through 16 stages from dataset to executive memo. |
| **Career** | ATS-style application Kanban/table, target-company list, job-platform links, resume/LinkedIn/GitHub checklists, networking log, application funnel metrics. |
| **Interview Center** | 11 question banks with 1–5 confidence, project interview simulator, business-case framework (Define → Segment → Investigate → Measure → Visualize → Explain → Recommend). |
| **System** | Catch-Up Mode (classifies missed work and reschedules within a daily cap — never dumps it on tomorrow), spaced-repetition revision (1/3/7/14/30 d), notes vault, calendar, weekly/monthly reviews, streak/XP/badges, December job-ready checklist. |

## Stack

React 18 · Vite · Tailwind CSS · react-router (hash) · zustand (persisted to `localStorage`) · Recharts · Lucide · PWA service worker (offline + installable)

No server, no accounts: all data stays in the user's browser. **Settings → Export / Import backup** moves it between devices.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Production / offline

```bash
npm run build      # → dist/
npm run preview    # serves dist/ at http://localhost:3000
```
Open in Chrome/Edge and click **Install** in the address bar — it becomes a standalone app that works with WiFi off. On Android: Chrome menu → *Add to Home screen*. On iPhone: Safari share → *Add to Home Screen*.

## Deploy

Zero-config on **Vercel** or **Netlify** — import the repo, framework auto-detects as Vite (`vercel.json` / `netlify.toml` included).

## Structure

```
src/
  data/       roadmap.js (weeks, phases), skills.js (evidence gates), projects.js, interview.js, library.js
  engine/     tasks.js (task generation), priority.js (ranking, catch-up, reminders), scoring.js (readiness, streaks, XP)
  store/      useStore.js (zustand + localStorage)
  components/ Layout, TaskCard, CommandPalette, ui primitives
  pages/      Dashboard, Today, Plans, Calendar, Roadmap, Skills, Learning, Projects, Interviews, Career, System
```

## Design principles

20 % theory / 80 % practice · Learn → Practice → Apply → Explain → Test → Revise · analytics-focused Python only · DSA capped at LOW priority · no fake progress, no dead buttons, no lorem ipsum.
