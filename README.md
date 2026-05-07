# Get Monké‑d

> They see just a monkey meme, I see mankind unmasked.

A whimsical web app that pairs portraits of contemplative monkeys with raw, first-generation-human-energy existential one-liners. Built with Next.js 16, Tailwind v4, and a dash of Claude.

Inspired by [@philosophymonkeyofficial](https://www.instagram.com/philosophymonkeyofficial) on Instagram.

## Stack

- Next.js 16 (App Router) + React 19
- Tailwind CSS v4
- shadcn-style components on Radix UI primitives
- Sonner toasts, Lucide icons
- Self-hosted monke portraits in `public/monkeys/`
- Quotes pool in `public/quotes.json`

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Expanding the quote pool

The app ships with 80 seed quotes in `public/quotes.json`. To grow this pool with fresh, AI-generated quotes:

```bash
# 1. Set your Anthropic API key
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local

# 2. Run the generator (default: 2000 quotes)
npx tsx scripts/generate-quotes.ts

# Custom target / batch size
TARGET=5000 BATCH=80 npx tsx scripts/generate-quotes.ts
```

The script uses `claude-haiku-4-5` with prompt caching (the system prompt is cached across batches so most of each request is billed at ~10% of standard input cost). Generating 2000 quotes runs about $0.20–$0.40.

The output overwrites `public/quotes.json`. Re-running adds variety; the script dedupes within a single run but won't dedupe against the existing file (re-run from scratch when expanding).

## Adding more monkey images

Drop additional PNGs into `public/monkeys/` named `monke-N.png` and update the count loop in `lib/providers/image-provider.ts`.

## Deploy

Push to a Vercel-linked GitHub repo. No env vars needed at runtime — quote generation is a build/dev-time script, the deployed site reads the static `quotes.json`.
