# Product map — Fathom journey (post session 01)

**Evidence base:** [`verified-session-01.md`](./verified-session-01.md) + screenshots `01`–`05`.  
**Rule:** Priorities mix VERIFIED product shape with ruthless 24h judgment. Architecture still undecided.

Recognizable loop we must echo:

```
Auth / desktop setup / permissions / Meet+extension capture   ← stub / OUT
  → meeting happens + pause/resume + floating controls        ← stub / OUT
    → processed
      → email delivery                                        ← optional mock / OUT
        → My Meetings + Ask Fathom (My Calls)
          → Meeting detail (Summary | Action Items | Transcript)
            + right rail: Player + Ask Fathom (This Call)
              → retrieve / share / later follow-through
```

---

## Stage A — Authentication & desktop onboarding

| | |
|--|--|
| **User goal** | Get into a trusted capture setup quickly |
| **Fathom surface** | Google/Microsoft auth; desktop download; intro video (Skip/Mute); Login→browser auth→desktop; setup Qs; mic/camera/recording permissions |
| **Verified interaction** | Full path completed in session 01 (manual) |
| **Data required** | Account identity, permission grants |
| **Our priority** | Narrative understanding only |
| **Real vs stubbed** | **Stub / omit** |
| **Importance** | **OUT** |

---

## Stage B — Chrome extension / Meet integration / floating controls

| | |
|--|--|
| **User goal** | Capture without leaving the meeting; pause/resume; quick controls |
| **Fathom surface** | Meet-associated controls; pause/resume; floating desktop control |
| **Verified interaction** | Meeting detection, pause/resume, floating controls (manual) |
| **Data required** | Live session state |
| **Our priority** | Do not rebuild clients |
| **Real vs stubbed** | **Stub** — meetings appear already captured |
| **Importance** | **OUT** |

**Judgment:** Reproducing desktop app, extension, detection, and real recording is a poor use of 24 hours. Brief allows faking capture.

---

## Stage C — Meeting happens / recording

| | |
|--|--|
| **User goal** | Run the meeting; trust capture |
| **Fathom surface** | In-call capture state |
| **Verified interaction** | Short Google Meet recorded successfully |
| **Data required** | Media + participants + duration |
| **Our priority** | Seeded media only |
| **Real vs stubbed** | **Stub pipeline**; **real seeded assets** |
| **Importance** | Capture pipeline **OUT** · playable media **P0** |

---

## Stage D — Processing

| | |
|--|--|
| **User goal** | Know when review is ready |
| **Fathom surface** | Processing then ready meeting + email |
| **Verified interaction** | Meeting became reviewable; email arrived |
| **Data required** | Job status, artifacts |
| **Our priority** | Optional polish |
| **Real vs stubbed** | Fake/omit processing UI OK |
| **Importance** | **P2** cosmetic / **OUT** real pipeline |

---

## Stage E — Post-meeting email

| | |
|--|--|
| **User goal** | Get summary + deep link without opening the app first |
| **Fathom surface** | Branded email: Action Items + Meeting Summary (Enhanced Template) + View Meeting / Ask Fathom |
| **Verified interaction** | Email content documented in `01-email-post-meeting.png` |
| **Data required** | Same summary/action payloads as app |
| **Our priority** | Understand loop; not ship mail infra |
| **Real vs stubbed** | Optional static mock only |
| **Importance** | **OUT** (send) · **P2** (static preview mock if ahead) |

**VERIFIED tension:** Email ACTION ITEMS empty while summary Next Steps full — same inconsistency as in-app Action Items tab.

---

## Stage F — My Meetings (library/home)

| | |
|--|--|
| **User goal** | Find recent meetings; optionally ask across calls |
| **Fathom surface** | Dark My Meetings list grouped by relative date; card = thumbnail/waveform + duration + title + blurb + avatars; right **Ask Fathom** (`My Calls`) |
| **Verified interaction** | List + Ask chrome observed (`02-...`) |
| **Data required** | Meetings index, blurbs, participants, media thumbs |
| **Our priority** | Must feel like Fathom home |
| **Real vs stubbed** | Seeded library **real UX**; Ask answers may be thin/deterministic |
| **Importance** | Library **P0** · Ask Fathom home chrome **P0-thin / P1** (see mvp-scope) |

**Strategy note:** Cross-meeting AI is prominent — differentiation cannot be “add meeting chat about promises.”

---

## Stage G — Meeting detail (center of gravity)

| | |
|--|--|
| **User goal** | Review what happened with media + AI artifacts |
| **Fathom surface** | Header (back, title, date, participants, Share, overflow); tabs **Summary | Action Items | Transcript**; right rail **Player + Ask Fathom (This Call)** |
| **Verified interaction** | IA confirmed across screenshots `03`–`05` |
| **Data required** | Full meeting package |
| **Our priority** | Highest fidelity reconstruction |
| **Real vs stubbed** | Interactions real; content seeded |
| **Importance** | **P0** |

---

## Stage H — Summary (+ templates)

| | |
|--|--|
| **User goal** | Skim structured account of the meeting |
| **Fathom surface** | Enhanced Summary: Purpose, Key Takeaways, Topics, Next Steps; Send to… / Copy; template labeling (Enhanced Template / Change Template in email) |
| **Verified interaction** | Content quality high on planted facts; play/jump affordance on at least one takeaway |
| **Data required** | Structured summary sections; template id |
| **Our priority** | Match structure; decide template switcher depth after remaining recon |
| **Real vs stubbed** | Precomputed summaries; optional 2–3 template presets |
| **Importance** | Enhanced Summary structure **P0** · Template switcher **P0-thin or P1** pending template recon |

---

## Stage I — Action Items

| | |
|--|--|
| **User goal** | See extractable todos as a dedicated list |
| **Fathom surface** | Primary tab; empty state “No action items detected.” |
| **Verified interaction** | Empty despite summary Next Steps containing commitments (**this meeting**) |
| **Data required** | Action item objects (when present): text, owner?, due?, evidence? |
| **Our priority** | Keep tab for fidelity; populate reliably in **our** product via Meeting Outcomes |
| **Real vs stubbed** | Seeded items + empty state both needed in demo story |
| **Importance** | Surface **P0** · trusting Fathom’s extractor **N/A** (we seed) |

---

## Stage J — Transcript + player

| | |
|--|--|
| **User goal** | Verify claims; navigate by speaker/time |
| **Fathom surface** | Speaker, timestamp, text, search chrome, utterance actions; player ±10s, scrub, speed, time |
| **Verified interaction** | Layout verified; sync behavior **not** verified |
| **Data required** | Timestamped utterances + media aligned to timeline |
| **Our priority** | Sync must be excellent once verified contract is known |
| **Real vs stubbed** | Seeded transcript + real sync interactions |
| **Importance** | Transcript + player **P0** · sync behavior **P0** after recon confirms contract |

---

## Stage K — Ask Fathom

| | |
|--|--|
| **User goal** | Ask questions without hunting the transcript |
| **Fathom surface** | Home `My Calls` + detail `This Call`; suggested prompts; Ask anything… |
| **Verified interaction** | Chrome + prompts verified; **answers not tested** |
| **Data required** | Retrieval over meetings / single meeting |
| **Our priority** | Recognizable chrome; avoid making chat the differentiator |
| **Real vs stubbed** | Deterministic demo answers OK; full LLM optional |
| **Importance** | Meeting-scoped Ask chrome **P0-thin/P1** · Cross-meeting Ask **P1** · deep agent quality **OUT** |

---

## Stage L — Share / clips / highlights / search

| | |
|--|--|
| **User goal** | Retrieve and distribute moments |
| **Fathom surface** | Share button visible; search in transcript chrome visible; highlights/clips **not observed this session** |
| **Verified interaction** | Share control exists; behaviors unknown |
| **Data required** | Share permissions, clip bounds, search index |
| **Our priority** | Finish remaining recon before freezing |
| **Real vs stubbed** | TBD |
| **Importance** | **TBD → likely P0/P1 mix** after remaining tests |

---

## Stage M — Later follow-through

| | |
|--|--|
| **User goal** | Ensure agreements survive past the meeting page |
| **Fathom surface** | Ask prompts about promises/deadlines (verified chrome); unknown whether persistent outcome objects / inbox exist |
| **Verified interaction** | Prompt marketing only so far |
| **Data required** | Typed outcomes with status across meetings |
| **Our priority** | **Our** Meeting Outcomes (+ thin Needs Attention if P0 polish allows) |
| **Real vs stubbed** | Seeded graph across 2–3 meetings |
| **Importance** | In-meeting Outcomes panel **P0 (differentiator)** · Cross-meeting Needs Attention **P1** (amplifier) |

---

## Ruthless build vs stub summary

| Build for real (UX) | Stub / OUT |
|---------------------|------------|
| My Meetings | Desktop onboarding |
| Meeting detail IA | Chrome extension |
| Player | Live Meet detection/recording |
| Transcript + sync | Real email sending |
| Enhanced Summary | Zoom/Teams deep integrations |
| Action Items tab | Perfect live ASR |
| Meeting Outcomes (ours) | Second flagship AI product |
| Search / share (after recon) | Full multilingual ASR pipeline as P0 |

---

## Revision log

| Date | Change |
|------|--------|
| 2026-09-30 | Initial unverified journey draft |
| 2026-10-01 | Rewrote from session 01 VERIFIED capture + post-meeting IA; stub judgment hardened |
