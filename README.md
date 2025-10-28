# Shopping Chat Agent (Mobiles)

AI shopping assistant for discovering, comparing, and explaining mobile phones. Built with Next.js + Prisma + Gemini.

## Live Demo
- Deploy to Vercel and paste link here.

## Tech Stack
- Next.js 14+ (App Router), React, Tailwind
- Prisma + SQLite (seeded from JSON)
- Google AI Studio (Gemini 1.5 Flash)
- Zod for validation

## Setup
```bash
pnpm i # or npm i / yarn
cp .env.example .env # add GEMINI_API_KEY
npx prisma generate
npx prisma db push
pnpm db:seed
pnpm dev
```

## Architecture

* API routes: `/api/chat` (intent → results), `/api/search`, `/api/compare`, `/api/details`
* LLM only parses intent to strict JSON; recommendations draw strictly from DB results
* Rule-based ranking; comparison table uses normalized fields

## Prompt & Safety

* Refuse prompt injections, secrets, biased brand insults, and off-topic content
* Show "Not in dataset"/omit fields rather than guessing

## Known Limitations

* Demo dataset: not exhaustive; prices are indicative
* Ranking is rule-based; no embeddings or feedback loop yet

## Future Work

* Add embeddings re-ranker; add pagination and filters UI
* Add affiliate links / checkout stubs (for demo only)
