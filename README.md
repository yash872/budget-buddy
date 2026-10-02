# Budget Buddy 🌱

A weekly money check-in that talks to you like a friend, not a spreadsheet.

Log what you spend in ten seconds. Once a week, ask for a check-in and **Gemma**
(via Google AI Studio) reads your last 7 days of spending and responds like a
supportive friend would — no red "you're over budget" banners, no shame, no
financial jargon. Just a warm, honest summary, one or two categories gently
worth a second look, and three concrete, doable tips.

Built for a real friend (and then for myself too) as a Hacktoberfest 2026
"Build for a Friend" weekend challenge submission.

**Live app:** https://budget-buddy-a2ng.onrender.com
Two seeded profiles appear on the welcome screen — **"Vini"** (a frequent
traveler, spiky trip-heavy spending) and **"Yash"** (the builder, food delivery
+ dev-tool subscriptions). Toggle between them with the friend-switcher; each
has ~5 weeks of realistic history and four real Gemma check-ins.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript
- **Tailwind CSS v4**
- **MongoDB Atlas** — plain `mongodb` driver, two flat collections (`expenses`, `checkins`), no ORM
- **Gemma** via Google AI Studio (`@google/genai`) for the weekly check-in
- **Sentry** — error tracking + a named span around the Gemma call for AI-call tracing
- **Render** — hosting, free tier, deployed via `render.yaml`

## How it works

- No auth system. A friend's name is saved in `localStorage` and sent with
  every API call to scope their data — enough for a weekend build serving a
  handful of real people on one deployed instance.
- `api/profiles/route.ts` returns the distinct profile names that have data, so
  a fresh browser's welcome screen and friend-switcher can show the seeded
  profiles as one-click picks instead of a blank name-entry box. `useProfile.ts`
  merges those names with the device's own `localStorage` history (best-effort —
  a failed fetch never blocks the app).
- `lib/aggregate.ts` groups spending by category once, and that same logic
  feeds both the dashboard chart and the Gemma prompt builder, so the UI and
  the AI are always looking at the same numbers.
- `lib/gemma.ts` asks Gemma for a plain-text response with `SUMMARY:` /
  `WATCH:` / `TIPS:` markers (deliberately not JSON — structured output tends
  to flatten the tone), and parses it with regex. If the model drifts from the
  format, it falls back to storing the raw text rather than erroring out.

## Local development

Copy `.env.local.example` to `.env.local` and fill in:

```bash
MONGODB_URI=            # free M0 cluster at mongodb.com/cloud/atlas
GOOGLE_AI_API_KEY=      # free key at aistudio.google.com/apikey
GEMMA_MODEL_NAME=gemma-4-26b-a4b-it
SENTRY_DSN=             # optional, free project at sentry.io
```

Then:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Deployed on [Render](https://render.com)'s free tier via the `render.yaml`
blueprint in this repo. Secrets (`MONGODB_URI`, `GOOGLE_AI_API_KEY`,
`SENTRY_DSN`, etc.) are set directly in the Render dashboard, not committed.

## Project structure

```
app/
  page.tsx              # profile capture + expense entry form
  dashboard/page.tsx     # category chart + "get my weekly check-in"
  history/page.tsx       # past check-ins
  api/expenses/route.ts   # log + list expenses
  api/checkin/route.ts    # aggregate -> Gemma -> persist
  api/checkins/route.ts   # list past check-ins
  api/profiles/route.ts   # distinct profile names that have data (switcher discovery)
components/              # EntryForm, SpendingChart, CheckinCard, CheckinHistoryList, ProfileBadge, NavBar
lib/                      # mongodb.ts, gemma.ts, aggregate.ts, categories.ts, types.ts, useProfile.ts
render.yaml
```
