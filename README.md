# Brief — AI meeting notetaker (Fathom-class reconstruction)

**Brief** turns conversations into structured decisions, commitments, risks and unresolved questions — grounded back to what was actually said.

## Fathom reconstruction

Working product surfaces:

- My Meetings
- Meeting detail
- Enhanced Summary
- Action Items
- Transcript
- Media player + playback ↔ transcript sync
- Follow playback / highlighting / search
- Ask (seeded + live)
- Public share route

## Improvement — Reliable Meeting Outcomes

Important meeting information becomes typed, evidence-linked objects:

- **Decision**
- **Commitment** (owner · due · status)
- **Risk**
- **Decision change**
- **Open question**

Clicking **Evidence** opens Transcript, seeks (when audio exists), highlights, and scrolls to the source utterance.

**Action Items are derived from the same canonical outcomes** (commitments / next steps) — not a second conflicting LLM pass.

## Live AI (Groq Cloud)

- Provider: **Groq Cloud** (`https://api.groq.com/openai/v1`)
- Model: `openai/gpt-oss-120b` (override with `GROQ_MODEL`)
- API key: server-side only via `GROQ_API_KEY` (never `NEXT_PUBLIC_`)

### What live AI does

1. **Analyze Meeting** — paste any compatible transcript (or load the Q4 example)
2. Deterministic utterance parser assigns IDs (`u1`, `u2`, …)
3. One Groq call returns canonical structured intelligence
4. Server validates evidence IDs against the parsed transcript
5. Generated meeting appears in My Meetings (localStorage) and uses the same detail UI
6. **Ask This Call** — arbitrary grounded Q&A with clickable evidence

### Architecture

```
Transcript
  → deterministic utterance parser (app-owned IDs)
  → Groq canonical analysis
  → server validation (drop fabricated evidence IDs)
  → Summary + Action Items + Outcomes (one understanding layer)
  → grounded Ask
```

## Intentionally stubbed

Capture was intentionally stubbed under the hackathon allowance. We did **not** build:

- Desktop app / browser extension / live Meet·Zoom·Teams capture
- Calendar OAuth theater
- Production ASR / diarization / live speech-to-text

Effort went into post-meeting intelligence and reliability.

Seeded meetings remain as a deterministic fallback if Groq is unavailable.

## Recall.ai Meeting Bot

Production capture uses **Recall.ai Meeting Bots** in `us-east-1` (workspace **HM Daniyal**).

### Product choices

- **Meeting URL launch** at `/capture` — user pastes Zoom / Meet / Teams / Webex URL; backend creates the bot after persisting a local intent.
- **Calendar V2 (Google)** at `/calendar` — syncs events; **recording is opt-in per event** (connecting a calendar does not auto-record).
- **Post-meeting** Recall.ai Transcription (`recallai_async` after `recording.done` → `transcript.done`).
- Webhooks at `/api/webhooks/recall` (verified with `RECALL_WEBHOOK_VERIFICATION_SECRET`).

### Required env

See `.env.example`. `PUBLIC_API_BASE_URL` must be a stable HTTPS origin (Vercel production URL or reserved ngrok) — never localhost.

### Local checks

```bash
npm run test:recall
npm run smoke:recall
```

### Interactive meeting test

After deploy + webhook registration, open `/capture`, paste a real meeting URL, and confirm before the bot joins.

## Local setup

```bash
cp .env.example .env.local
# set GROQ_API_KEY=... and optionally GROQ_MODEL=openai/gpt-oss-120b

npm install
npm run dev
# http://localhost:3000
```

Smoke-test analysis:

```bash
curl -sS http://localhost:3000/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"title":"Smoke","transcript":"Daniyal [00:00]:\nI will finish the dashboard by Friday."}'
```

## Deploy (primary: Vercel)

Static GitHub Pages cannot run secure server-side Groq routes. **Primary live app = Vercel.**

Set environment variables in the Vercel project:

- `GROQ_API_KEY`
- `GROQ_MODEL=openai/gpt-oss-120b`

```bash
npx vercel --prod
```

GitHub Pages remains a static fallback for the seeded UI only (`GITHUB_PAGES=true npm run build`) and will not include live Analyze/Ask.

## Demo walkthrough (~5 min)

1. Open Brief → My Meetings  
2. Open **Atlas Dashboard Weekly Sync** — Summary, Action Items, Transcript sync  
3. Reliable Meeting Outcomes → click Evidence  
4. **Analyze Meeting** → Load example (**Q4 Mobile Launch Review**)  
5. Say: “This result is not precomputed.” → Analyze  
6. Open generated meeting → commitments / risks / decision change / open question  
7. Click evidence on an outcome  
8. Ask: “Why did the launch date change?” → click answer evidence  

## Stack

- Next.js 15 (App Router) · TypeScript · Tailwind CSS v4  
- Groq OpenAI-compatible API (no LangChain / no vector DB)  
- localStorage for generated meetings  

## Agent capture

Cursor hooks write to [`.agent-logs/`](./.agent-logs/). See [`CAPTURE-TEST.md`](./CAPTURE-TEST.md).
