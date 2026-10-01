# Recall.ai integration notes

## Workspace

- Name: HM Daniyal
- UUID: `f8d5b6da-b98e-456f-9df9-e07d8188196c`
- Region: `us-east-1`
- Docs / bot schema: v1.11

## Scheduling decision

- Primary UX: calendar opt-in scheduling via Recall Calendar V2 (Google).
- Meeting-URL launch (`/capture`) is the explicit ad-hoc / test surface — not the default recurring UX.
- **Opt-in rule:** a bot is scheduled only when the user turns **Record with Brief** on for that calendar event. Connecting a calendar authorizes sync only.

## Persistence (portfolio / deadline-safe)

- **Recall** is the source of truth for recordings + transcripts.
- Server `data/recall/store.json` (local) or `/tmp/brief-recall` (Vercel) caches intents + captured meetings. **Vercel `/tmp` is ephemeral** — not a database.
- When `/capture` (or meeting detail) receives a finalized meeting, the browser saves it into `brief.generatedMeetings.v1` localStorage — the same collection as transcript analysis — so `/dashboard` and `MeetingLoader` see it.
- Captured meetings are scoped by the Google session email that launched/claimed the bot.
- Recover an existing Recall bot into the signed-in browser library: `/capture?bot=<recall-bot-uuid>`

## Webhook lifecycle (v1.11)

1. `bot.*` → update local intent status
2. `recording.done` → `POST /api/v1/recording/{id}/create_transcript/` with `recallai_async`
3. `transcript.done` → download transcript → optional Groq analysis → persist captured meeting
4. `calendar.sync_events` → re-fetch events → apply opt-in schedule/remove

Endpoint: `{PUBLIC_API_BASE_URL}/api/webhooks/recall`
