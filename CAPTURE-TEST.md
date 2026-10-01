# CAPTURE-TEST.md

Capture verification for the 8x assignment. Do not assess the product build until this is green.

## Tool and model (step 1)

- **Tool:** Cursor (Agent chat)
- **Model(s):** Composer in the install/setup session (reported as `default` by the hook payload). Canary 2 session used `grok-4.7`. Same agent session plans and executes; no separate planner/executor pair was configured for canary 1.
- **Automatic mechanism:** Yes — Cursor project hooks

## Mechanism and config

- **Mechanism:** Cursor lifecycle hooks that run a command automatically on every prompt and every agent response
- **Config file changed:** `.cursor/hooks.json`
- **Capture script:** `.cursor/hooks/agent-capture.py`
- **Events wired:**
  - `beforeSubmitPrompt` → appends `[LOG_ENTRY type=PROMPT ...]`
  - `afterAgentResponse` → appends/replaces `[LOG_ENTRY type=RESPONSE ...]` (last text for that turn wins)
- **Output directory:** `.agent-logs/` (committed; only `.agent-logs/.state/` is gitignored)

Also checked before installing hooks:

- Cursor docs for hooks (`beforeSubmitPrompt`, `afterAgentResponse`)
- On-disk agent transcripts at `~/.cursor/projects/.../agent-transcripts/` (exist, but include tool/thinking noise, so not used as the primary capture path)

## Log files the canaries landed in

1. Session 1 (this chat):  
   `.agent-logs/2026-09-30_14-57-05_cb5d82a4-43f6-4144-8096-805d553974c1.md`
2. Session 2 (new Agent chat):  
   `.agent-logs/2026-09-30_14-58-23_a3129fe9-9476-42de-8da2-6f80c5071de2.md`

Two different `session_id` values → hook works across sessions, not only the session that created it.

## Canary entries (raw)

### Canary 1 — from `.agent-logs/2026-09-30_14-57-05_cb5d82a4-43f6-4144-8096-805d553974c1.md`

```
[LOG_ENTRY type=PROMPT num=1 session=cb5d82a4]
timestamp: 2026-09-30T14:57:05.698Z
model: default

CAPTURE TEST — 8x assignment, HM Daniyal

[LOG_ENTRY type=RESPONSE num=1 session=cb5d82a4]
timestamp: 2026-09-30T14:57:21.320Z
model: default

**Canary 1 — PROMPT captured.**

Log file: `.agent-logs/2026-09-30_14-57-05_cb5d82a4-43f6-4144-8096-805d553974c1.md`

The hook fired on `beforeSubmitPrompt` with your exact text. This response should land via `afterAgentResponse` when the turn ends.

**Next:** open a **new Agent chat** in this repo and send:

`CAPTURE TEST 2 — 8x assignment, HM Daniyal`

Then come back here and confirm (or paste the second log path). After both canaries show prompt + response, I’ll write `CAPTURE-TEST.md`.
```

### Canary 2 — from `.agent-logs/2026-09-30_14-58-23_a3129fe9-9476-42de-8da2-6f80c5071de2.md`

```
[LOG_ENTRY type=PROMPT num=1 session=a3129fe9]
timestamp: 2026-09-30T14:58:23.164Z
model: grok-4.7

CAPTURE TEST 2 — 8x assignment, HM Daniyal

[LOG_ENTRY type=RESPONSE num=1 session=a3129fe9]
timestamp: 2026-09-30T14:58:53.851Z
model: grok-4.7

**Canary 2 — PROMPT captured.**

Log file: `.agent-logs/2026-09-30_14-58-23_a3129fe9-9476-42de-8da2-6f80c5071de2.md`

`beforeSubmitPrompt` recorded the exact text `CAPTURE TEST 2 — 8x assignment, HM Daniyal` at `2026-09-30T14:58:23.164Z` (session `a3129fe9`, model `grok-4.7`). This reply should be appended by `afterAgentResponse` when the turn ends.

Go back to the first Agent chat and confirm both logs show a prompt and a response. After that, `CAPTURE-TEST.md` can be written.
```

## What was tried first that did not work

- Nothing substantive failed on the capture path itself. Project hooks were the first automatic mechanism installed after confirming Cursor supports them.
- Sandbox permission blocks while creating `.cursor/` during setup required unrestricted shell (`all` permissions) — install-time only, not a capture failure.
- Initial dry-run used a non-UUID session id (`dry-run-session-0001`), which truncated the short session label oddly; cleaned up before canaries. Real UUID session ids work as expected.
- The assignment paste that installed the hooks was submitted *before* hooks existed, so that first turn is not in `.agent-logs/` (expected; canaries are the proof).

## Status

**GREEN.** Prompt + response captured in two separate sessions. Assignment build may start.
