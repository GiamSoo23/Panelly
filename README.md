# OneEthos

BloomHacks · Clean Energy Track · Next.js (App Router) on Vercel.

A gamified loop for understanding, then cutting, home energy costs — 11-question
habits survey → energy estimate → solar comparison → tips → history.

## Getting started

Requires Node 20.9+ (see `.nvmrc` — `nvm use` or install Node 22).

```bash
npm install
cp .env.example .env.local   # fill in keys as you get them, see .env.example for how
npm run dev
npm test                     # vitest — schema + persistence unit tests
```

Persistence works without any keys: with no `DATABASE_URL` the app still runs,
it just doesn't save. Add the Neon connection string to `.env.local` and the
tables (`users`, `submissions`, `results`) auto-create on first save.

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

Two seams let you build without waiting on each other:
- `src/lib/persistence/persistSubmission.ts` — wired to Neon (falls back to a
  no-op without `DATABASE_URL`); call it with `(input, result)` and it handles
  the rest. Read saved runs with `getUserSubmissions()` / `getSubmissionById()`
  from `src/lib/persistence/neon.ts`.
- `src/lib/auth/getUserId.ts` — returns `NEXT_PUBLIC_DEMO_USER_ID` for now,
  Connie swaps in Clerk's `auth()` later.

The survey pivoted from photo upload to an 11-question habits survey — the
question options live as `*_OPTIONS` lists next to `SurveyInputSchema`, so use
those for form labels instead of hardcoding strings. `/survey`, `/results/[id]`,
and `/api/survey` currently hold working placeholders (marked `NOTE(connie)`)
so the whole flow demos end-to-end — replace them freely, they're your areas.

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
