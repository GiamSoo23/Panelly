# OneEthos

BloomHacks · Clean Energy Track · Next.js (App Router) on Vercel.

A gamified loop for understanding, then cutting, home energy costs — survey →
appliance ID → bill read → solar comparison → tips → history.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in keys as you get them, see .env.example for how
npm run dev
```

## Team split — where to work

One repo, split by folder, so we all get a live Vercel URL on every push. Fork
this repo, work in your area, open a PR back into `main`.

| Person | Area | Files |
| --- | --- | --- |
| Gregory | Backend / API | `src/app/api/survey/`, `src/lib/{geo,solar,energy,places,ai,payback}/` |
| Adriana | Survey & input UI | `src/app/survey/` |
| Connie | Auth & data | Clerk wiring, Neon schema, `src/app/history/`, `src/lib/persistence/persistSubmission.ts`, `src/lib/auth/getUserId.ts` |
| Julia | Results UI | `src/app/results/[id]/` |

## Shared contract

`src/lib/schemas/survey.ts` is the single source of truth for the data shapes
(`SurveyInput`, `SurveyResult`) everyone builds against, so UI work can start
before the backend is wired up. Import types from there instead of redefining
them.

Two stub seams let you build without waiting on each other:
- `src/lib/persistence/persistSubmission.ts` — no-op today, Connie swaps in
  real Neon/Drizzle queries later without changing its signature.
- `src/lib/auth/getUserId.ts` — returns `undefined` today, Connie swaps in
  Clerk's `auth()` later.

## Routes

- `/survey` — Adriana
- `/results/[id]` — Julia (dynamic by `submissionId`)
- `/history` — Connie
- `/api/survey` — Gregory (not built yet)
- `/api/health` — trivial health check, proves the deploy pipeline works

## Deploys

Every push to `main` deploys to Vercel automatically once the project is
linked. Land the base scaffold and check the live URL before layering on
feature work.
