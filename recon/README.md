# Fathom Reconnaissance — master checklist

**Phase:** Product research (session 01 complete). **No application implementation yet.**  

| Label | Meaning |
|-------|---------|
| **VERIFIED** | Hands-on observation and/or clearly visible in screenshots |
| **HYPOTHESIS** | Plausible, not yet tested |
| **OPPORTUNITY** | Improvement suggested by verified evidence |
| **UNKNOWN** | Material gap before scope freeze |

**Primary session write-up:** [`verified-session-01.md`](./verified-session-01.md)  
**Also:** [`product-map.md`](./product-map.md) · [`opportunities.md`](./opportunities.md) · [`mvp-scope.md`](./mvp-scope.md)

```
recon/
  README.md
  verified-session-01.md
  product-map.md
  opportunities.md
  mvp-scope.md
  screenshots/     ← evidence (renamed 01–05)
  notes/
  evidence/
```

---

## Screenshot naming convention

```
NN-flow-screen-detail.png
```

Session 01 files (renamed from macOS defaults; contents unchanged):

| File | Flow |
|------|------|
| `01-email-post-meeting.png` | Post-meeting email |
| `02-home-my-meetings-ask-fathom.png` | My Meetings + Ask (`My Calls`) |
| `03-meeting-detail-summary.png` | Summary + player + Ask (`This Call`) |
| `04-meeting-detail-action-items-empty.png` | Action Items empty state |
| `05-meeting-detail-transcript.png` | Transcript chrome |

Continue numbering at `06-…` for new captures.

---

## Evidence log

| # | File | Proves | Status |
|---|------|--------|--------|
| 01 | `01-email-post-meeting.png` | Email loop; Enhanced Template; ACTION ITEMS empty; rich summary/Next Steps | VERIFIED |
| 02 | `02-home-my-meetings-ask-fathom.png` | My Meetings IA; Ask Fathom cross-meeting prompts + `My Calls` | VERIFIED |
| 03 | `03-meeting-detail-summary.png` | Detail IA; Enhanced Summary sections; player; Ask `This Call`; takeaway jump affordance | VERIFIED |
| 04 | `04-meeting-detail-action-items-empty.png` | Action Items primary tab; empty copy despite summary commitments | VERIFIED |
| 05 | `05-meeting-detail-transcript.png` | Transcript speaker/time/text/search; persistent right rail | VERIFIED |

---

## RECON FROZEN — 2026-10-01

Session complete. Sync contract VERIFIED. Web-app delivery confirmed. Speaker-turn grouping issue recorded (single-meeting, non-generalized).

**Do not continue reconnaissance.** Implementation in progress under `mvp-scope.md` final P0.

## Strategy snapshot (after session 01)

**VERIFIED product model (compressed)**

- Capture stack is multi-client (desktop + extension/Meet controls + browser auth).  
- Post-meeting desktop app is the review product: My Meetings → meeting detail.  
- Detail IA: **Summary | Action Items | Transcript** + right rail **Player + Ask Fathom**.  
- Enhanced Summary is structured and strong on planted facts.  
- Action Items can report none while Summary Next Steps list commitments (**this meeting**).  
- Ask Fathom exists at **My Calls** and **This Call**, with promise/deadline prompts on home.  
- Email is part of the loop (summary + CTAs), not a side alert.

**Primary differentiator (provisional):** [Reliable Meeting Outcomes](./opportunities.md) — typed, evidence-linked, consistent objects — **not** “add promise chat.”

**Capture clients:** **OUT / stub** for 24h (assignment allows; ROI poor).

---

## Flow status board

| # | Flow | Status | Evidence |
|---|------|--------|----------|
| 1 | Sign up / onboarding | **VERIFIED** (manual) | Session notes; no dedicated screenshots |
| 2 | Calendar connection | **UNKNOWN** | Not tested |
| 3 | Bot / extension into Meet | **VERIFIED** enough to stub | Manual |
| 4 | Recording / in-call controls | **VERIFIED** enough to stub | Pause/resume + floating controls |
| 5 | Post-meeting processing | **PARTIAL** | Result ready + email; stages not timed |
| 6 | My Meetings / home | **VERIFIED** | `02` |
| 7 | Meeting detail IA | **VERIFIED** | `03`–`05` |
| 8 | Video/audio playback chrome | **VERIFIED** chrome; behavior depth **UNKNOWN** | `03`–`05` |
| 9 | Transcript | **VERIFIED** layout | `05` |
| 10 | Playback ↔ transcript sync | **UNKNOWN** | Must test |
| 11 | AI summary | **VERIFIED** | `01`, `03` |
| 12 | Summary templates | **PARTIAL** | Label/controls seen; switch not tested |
| 13 | Action items | **VERIFIED** empty discrepancy | `01`, `04` |
| 14–15 | Highlights | **UNKNOWN** | Not tested |
| 16 | Search | **PARTIAL** | Transcript search chrome; global unknown |
| 17–18 | Clips / external share | **PARTIAL** | Share button; flows unknown |
| 19 | Long meeting ~1h / ~8 pax | **UNKNOWN** | Only ~2 min meeting tested |
| — | Ask Fathom scopes | **VERIFIED** chrome; answers **UNKNOWN** | `02`, `03` |
| — | Code-switch Urdu | **VERIFIED** one failure (manual) | Session notes |

---

## VERIFIED highlights (do not re-litigate)

### Onboarding / auth (manual)
Google & Microsoft; desktop download; intro video Skip/Mute; Login→browser→desktop; permissions for mic/camera/recording.

### Capture (manual)
Meet detection; in-meeting controls; pause/resume; floating desktop controls; Chrome extension in setup.

### Email (`01`)
Branding; meeting meta; View Meeting; Ask Fathom; ACTION ITEMS empty string; MEETING SUMMARY Enhanced Template + Customize + Change Template; structured Purpose / Takeaways / Topics / Next Steps; CTA; Ask promo.

### My Meetings (`02`)
Yesterday grouping; waveform thumb + duration; title; blurb; avatars; Ask Fathom + prompts (promises / summarize today / deadlines) + `My Calls`.

### Meeting detail (`03`–`05`)
Share; three tabs; Enhanced Summary sections; Send to… / Copy; Action Items empty state; transcript speaker/time/text/search; player ±10s, scrub, `1:45/1:45`, `1x`; Ask `This Call` prompts (subtext / warning signs / draft follow-up).

### Inconsistency (careful wording)
In this specific test meeting, Enhanced Summary extracted explicit commitments and next steps while the dedicated Action Items surface reported that no action items were detected.

### Code-switch (careful wording)
In this specific test meeting, an English→Urdu utterance was transcribed as incorrect English/gibberish-like text (`I am Fatharikuntha guy.`) rather than correctly as spoken.

---

## Revised hypotheses

| ID | Statement | Status |
|----|-----------|--------|
| H1 | Post-meeting review is the judged core; capture can be stubbed | **Strengthened** |
| H2 | Fathom treats meetings only as isolated archives | **REJECTED** — My Calls Ask is prominent |
| H3 | Differentiating via “what did I promise?” Ask is enough | **REJECTED** as flagship |
| H4 | Reliable typed Meeting Outcomes is the right flagship | **Leading** — supported by Action Items↔Summary gap |
| H5 | Templates are ignorable chrome | **Weakened** — visible Enhanced Template; depth UNKNOWN |
| H6 | Sync is click-utterance↔seek with auto-scroll | **HYPOTHESIS** — untested |
| H7 | Multilingual as P0 | **Rejected**; keep P1/P2 |

---

# Remaining reconnaissance (minimum that can change implementation)

Do **not** exhaust settings. Only tests below can materially change P0.

## R1 — Playback ↔ transcript sync — **VERIFIED / DONE**

**Test**
- Click utterance → does media seek? autoplay or pause?  
- Play → active utterance styling + auto-scroll?  
- Manual scroll while playing → sync pause? resume control?  
- Scrub player → transcript jump?

**Capture:** `06-sync-click-utterance.png`, `07-sync-playing-active-line.png`, `08-sync-scrub.png`  
**Notes:** `notes/10-sync.md`  
**Could change:** sync implementation contract; P0 polish bar.

## R2 — External share + clips *(high impact on P0 share shape)*

**Test**
- Share full meeting → incognito recipient: login wall? what’s visible?  
- Clip create (if found): range, preview, URL, vs highlight  

**Capture:** `09-share-owner.png`, `10-share-recipient-incognito.png`, `11-clip-create.png`  
**Could change:** whether P0 is full-meeting share, bounded clip page, or both.

## R3 — Summary templates *(medium — decides P0-thin vs P1)*

**Test**
- Change Template: list templates; switch; regenerate/loading; structure change; Customize depth  

**Capture:** `12-templates-picker.png`, `13-templates-switched.png`  
**Could change:** ship 2–3 seeded presets now vs Enhanced-only.

## R4 — Search deep-link *(medium)*

**Test**
- Transcript search results behavior  
- Any global/cross-meeting search UI  
- Result click → meeting + timestamp?  

**Capture:** `14-search-transcript.png`, `15-search-global.png`  
**Could change:** P0 search scope (local-only vs global).

## R5 — Highlights *(medium-low — may stay P1)*

**Test**
- Create during/after call; range; aftermath list; timestamp jump; relation to clips  

**Capture:** `16-highlight-create.png`, `17-highlight-list.png`  
**Could change:** promote highlights into P0 if central to brand chrome.

## R6 — Long meeting signal *(seed design, not necessarily record 60m)*

**Need**
- Transcript density, summary length, navigation affordances, marker clutter on a realistic long call  

**Efficient options:** observe any existing long meeting in account; or one ~20–30m multi-speaker call if no long meeting exists.  
**Capture:** `18-long-meeting-overview.png`, `19-long-meeting-transcript-density.png`  
**Could change:** seed script length, chapters P1 vs ignore.

## Explicitly defer

Calendar OAuth details, every settings page, Zoom/Teams parity, Ask Fathom answer quality (unless we promote Ask beyond canned P0-thin), billing/team admin.

---

# Per-flow checklists (abbreviated)

Use full protocol in `notes/*.md`. Session 01 already filled much of 1, 3–9, 11, 13.

### Still open — copy into notes when testing

**Sync (`notes/10-sync.md`)** — see R1.  
**Templates (`notes/12-templates.md`)** — see R3.  
**Highlights (`notes/14-highlight-live.md`, `15-highlight-aftermath.md`)** — see R5.  
**Search (`notes/16-search.md`)** — see R4.  
**Clip/Share (`notes/17-clip.md`, `18-share-external.md`)** — see R2.  
**Long meeting (`notes/19-long-meeting.md`)** — see R6.  
**Ask answers (optional) (`notes/21-ask-fathom-answers.md`)** — only if deciding against canned Ask.

### Session protocol

```md
# Flow: <name>
Date:
Screenshots:
## VERIFIED
-
## HYPOTHESIS
-
## OPPORTUNITY
-
## Raw observations
-
```

---

## Ready-to-build threshold

Recommend freezing scope → architecture only when:

1. **R1 sync** contract documented with screenshots.  
2. **R2 share/clip** recipient path known (or explicitly cut with rationale).  
3. **R3 templates** decision: Enhanced-only vs 2–3 presets.  
4. **R4 search** local-only vs global deep-link decided.  
5. Team confirms **Reliable Meeting Outcomes** still primary (or records pivot).  
6. Long-meeting seed approach chosen (R6 light pass).

Until then: update research only — **no frameworks, schemas, or app code**.

---

## Revision log

| Date | Change |
|------|--------|
| 2026-09-30 | Initial empty checklist |
| 2026-10-01 | Session 01 VERIFIED incorporated; remaining recon cut to R1–R6; screenshots renamed 01–05 |
