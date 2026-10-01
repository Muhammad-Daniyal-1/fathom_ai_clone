# Verified session 01 — hands-on Fathom recon

**Date of session:** 2026-09-30 (meeting) / 2026-10-01 (screenshot capture)  
**Researcher:** HM Daniyal  
**Meeting under test:** `Fathom meeting test`  
**Participant:** Muneeb Warsi (non-technical stakeholder)  
**Approx. duration (UI):** ~1:45–2 minutes (email shows “2 mins”; player shows `1:45 / 1:45`; thumbnail badge shows `1 min`)  
**Topic planted:** Atlas Dashboard project  

**Status labels used below:** VERIFIED · HYPOTHESIS · OPPORTUNITY · UNKNOWN

---

## Purpose of test

1. Observe real signup/onboarding and capture surfaces enough to decide stub vs build.  
2. Run one short meeting containing planted **decisions, commitments, risks, a decision change, and an open question**.  
3. Compare how Fathom’s **Summary**, **Action Items**, **email**, and **Transcript** represent the same source conversation.  
4. Observe **My Meetings** and **Ask Fathom** placement/scope.  
5. Note one intentional **English→Urdu code-switch** near the end.

This session does **not** fully verify playback↔transcript sync, template switching mechanics, highlights, clips, external recipient share, global search click-through, or long-meeting density.

---

## Environment / context

| Item | Observation | Label |
|------|-------------|-------|
| Primary post-meeting UI observed | Fathom **desktop application** (dark UI) | VERIFIED |
| Auth | Google and Microsoft offered; browser auth; return to desktop app | VERIFIED (manual) |
| Capture aids | Desktop app + Chrome extension / Meet-integrated controls + floating desktop controls | VERIFIED (manual) |
| Meeting platform | Google Meet | VERIFIED (manual) |
| Screenshots | `recon/screenshots/01`–`05` (renamed from macOS defaults) | VERIFIED |

---

## Screenshot evidence map

| File | What it proves |
|------|----------------|
| [`01-email-post-meeting.png`](./screenshots/01-email-post-meeting.png) | Post-meeting email: branding, meeting meta, View Meeting / Ask Fathom links, ACTION ITEMS empty copy, MEETING SUMMARY with Enhanced Template + Customize / Change Template, structured sections, View Meeting CTA, Ask Fathom promo |
| [`02-home-my-meetings-ask-fathom.png`](./screenshots/02-home-my-meetings-ask-fathom.png) | My Meetings list (Yesterday group), waveform thumbnail + duration badge, title, generated blurb, participant avatars; persistent Ask Fathom with suggested prompts and `My Calls` scope |
| [`03-meeting-detail-summary.png`](./screenshots/03-meeting-detail-summary.png) | Meeting detail IA: back link, title, date, Share, tabs Summary/Action Items/Transcript; Enhanced Summary sections; Send to… / Copy; right rail player + Ask Fathom (`This Call`); at least one summary takeaway shows a play/jump affordance |
| [`04-meeting-detail-action-items-empty.png`](./screenshots/04-meeting-detail-action-items-empty.png) | Action Items as a primary tab; empty state **“No action items detected.”**; same right-rail player + Ask Fathom |
| [`05-meeting-detail-transcript.png`](./screenshots/05-meeting-detail-transcript.png) | Transcript tab: speaker name, timestamp, utterance blocks, transcript search + copy chrome; right rail persists; player at end `1:45 / 1:45` |

---

## 1. Onboarding / authentication (manual)

**VERIFIED**

- Auth options included **Google** and **Microsoft**.  
- Signup/setup directed download/install of the **desktop application**.  
- First desktop launch showed an **intro/startup video** with **Skip** and **Mute**.  
- After that step: desktop **Login** → authentication in **browser** → return to desktop.  
- Desktop then asked onboarding/setup questions.  
- System permissions requested related to microphone, camera, audio/video, and meeting recording/capture.

**Product implication:** Full onboarding/desktop permission theater is real Fathom surface area, but is a poor use of a 24-hour rebuild budget when capture may be stubbed. Treat as **OUT / narrative-only**.

---

## 2. Capture ecosystem (manual)

**VERIFIED approximate stack**

```
Desktop app → onboarding → permissions → meeting detection → capture state → floating controls
Chrome extension / Meet integration → in-meeting controls → pause/resume capture
Browser → auth/authorization
Post-meeting app → processed meeting → summary / action items / transcript / Ask Fathom / sharing
```

**VERIFIED during Google Meet**

- Fathom detected the meeting.  
- In-meeting controls were available.  
- Pause/resume capture was available from the meeting experience.  
- A small/floating desktop control surface was available during the meeting.

**Product implication:** Building desktop app, extension, live detection, and real recording would consume the hackathon. Assignment allows stubbing. **OUT** unless later evidence shows judges require live capture (none yet).

---

## 3. Planted meeting scenario (source truth)

Conversation intentionally included (researcher-authored content, not Fathom extraction):

| Type | Content |
|------|---------|
| DECISION | Use PostgreSQL/Postgres instead of MongoDB |
| COMMITMENT | Daniyal finishes analytics dashboard by Friday |
| COMMITMENT | Sara sends API credentials tomorrow by 5 PM |
| RISK | Payment integration could delay launch |
| DECISION CHANGE | Beta launch moved Oct 15 → Oct 22 |
| OPEN QUESTION | Payment provider not decided |
| Context | Other participant was non-technical; indicated technical discussion was hard to follow |

These planted facts are the yardstick for comparing Summary vs Action Items vs Transcript.

---

## 4. Post-meeting processing / email

**VERIFIED** ([`01-email-post-meeting.png`](./screenshots/01-email-post-meeting.png) + manual)

After the meeting ended, Fathom processed the meeting and sent email containing:

- Fathom branding  
- Meeting with participant context (“Meeting with Muneeb Warsi”)  
- Title `Fathom meeting test`  
- Date `September 30, 2026` · duration `2 mins`  
- Links: **View Meeting**, **Ask Fathom**  
- **ACTION ITEMS** section  
- **MEETING SUMMARY** section with **Enhanced Template**, **Customize**, **Change Template**  
- Structured summary body  
- Large **View Meeting →** CTA  
- Promotional Ask Fathom section (“ChatGPT for your meetings!”)

**Interpretation:** Email is part of the post-meeting product loop (delivery of summary + CTA into the app), not a side notification.

**Email ACTION ITEMS copy (VERIFIED in screenshot):**  
“No action items detected in this meeting”

**Email summary (VERIFIED):** structured Enhanced Template with Meeting Purpose, Key Takeaways, Topics, Next Steps — including the planted commitments, decision change, Postgres decision, payment risk, and open payment-provider issue in prose/lists.

---

## 5. Important finding — Action Items vs Summary inconsistency

**VERIFIED for this specific test meeting**

Enhanced Summary (app + email) correctly surfaced execution-related content, including equivalents of:

- Beta launch moved Oct 15 → Oct 22  
- Postgres instead of MongoDB  
- Daniyal finishes analytics dashboard by Friday  
- Sara sends API credentials by tomorrow 5 PM  
- Payment integration as launch risk  
- Payment provider not selected  

Next Steps in summary included assignees for Sara, Daniyal, and Team items.

**Simultaneously:**

- Meeting detail **Action Items** tab: **“No action items detected.”** ([`04-...`](./screenshots/04-meeting-detail-action-items-empty.png))  
- Email **ACTION ITEMS**: **“No action items detected in this meeting”** ([`01-...`](./screenshots/01-email-post-meeting.png))

**Careful claim (do not overgeneralize):**  
In this specific test meeting, Fathom’s Enhanced Summary extracted explicit commitments and next steps while the dedicated Action Items surface reported that no action items were detected.

**OPPORTUNITY signal:** Structured “outcomes” that stay consistent across Summary / Action Items / follow-through would address a real reliability gap observed here — without claiming Fathom “never” detects actions.

---

## 6. My Meetings

**VERIFIED** ([`02-home-my-meetings-ask-fathom.png`](./screenshots/02-home-my-meetings-ask-fathom.png))

- Dark desktop UI  
- Heading **My Meetings**  
- Grouping by relative time (**Yesterday**)  
- Left: meeting list/card with waveform-style thumbnail, duration badge, title, generated description blurb, participant avatars  
- Right: large persistent **ASK FATHOM** panel  

Ask Fathom (home) suggested prompts included:

- Things I promised I'd do by this week  
- Summarize my meetings from today  
- Any looming deadlines?  

Also: free-form **Ask anything…** input; scope selector **My Calls**.

**Strategy revision:** Cross-meeting AI/retrieval is **not** buried. Do **not** claim Fathom only treats meetings as isolated archives. Do **not** differentiate merely by adding “what did I promise?” chat — Fathom already advertises that.

**Still distinct (HYPOTHESIS pending deeper Ask tests):** Asking AI about promises ≠ maintaining persistent, inspectable structured execution objects with status and evidence.

---

## 7. Meeting detail information architecture

**VERIFIED** ([`03`](./screenshots/03-meeting-detail-summary.png), [`04`](./screenshots/04-meeting-detail-action-items-empty.png), [`05`](./screenshots/05-meeting-detail-transcript.png))

**Header**

- Back to My Meetings  
- Meeting title  
- Relative date (Yesterday)  
- Participant indicator(s)  
- **Share** button  
- Link/copy-link control (visible with Share)  
- Overflow menu  

**Primary left tabs (three)**

1. Summary  
2. Action Items  
3. Transcript  

**Persistent right rail**

- Media playback controls (skip ±10s, play/replay, scrub bar, time `current / duration`, volume, speed e.g. `1x`)  
- Ask Fathom (scope **This Call** on meeting detail)  

Right rail remains while switching Summary / Action Items / Transcript (same chrome across the three screenshots).

This IA is a strong recognizability target for reconstruction.

---

## 8. Summary experience

**VERIFIED** ([`03-meeting-detail-summary.png`](./screenshots/03-meeting-detail-summary.png), email [`01`](./screenshots/01-email-post-meeting.png))

- Labeled **Enhanced Summary** (dropdown affordance in app)  
- Sections observed: **Meeting Purpose**, **Key Takeaways**, **Topics**, **Next Steps**  
- Topics examples: Launch Risk & Mitigation; Project Updates & Dependencies  
- Controls: **Send to…**, **Copy**  
- Email exposes **Enhanced Template**, **Customize**, **Change Template**  

**Also VERIFIED visually:** at least one Key Takeaway row shows a play/jump-style control — suggests summary→moment linking exists in some form.

**UNKNOWN (not tested this session):** full template catalog, switch behavior, regeneration/loading, custom templates.

**Scope note:** Templates are a real visible capability; earlier casual demotion to “ignore until late” was too aggressive. Still not automatic P0 — see `mvp-scope.md`.

---

## 9. Action Items surface

**VERIFIED** ([`04-meeting-detail-action-items-empty.png`](./screenshots/04-meeting-detail-action-items-empty.png))

- Primary tab in meeting detail  
- Empty state: **No action items detected.**  
- Reconstruction should keep an Action Items tab for Fathom fidelity even when empty; empty state is itself useful UX evidence.

---

## 10. Transcript experience

**VERIFIED** ([`05-meeting-detail-transcript.png`](./screenshots/05-meeting-detail-transcript.png))

- Speaker attribution (name + avatar/icon)  
- Timestamps  
- Utterance text (including multi-sentence blocks under one speaker)  
- Transcript search input + copy control  
- Comment/interaction-style icon affordance beside utterances (presence verified; behavior not tested)  
- Persistent player + Ask Fathom right rail  

Example structure matches: Speaker → timestamp → utterance, then next speaker/utterance.

Transcript content for this meeting includes the planted Atlas Dashboard technical block and the non-technical participant response roughly: difficulty following the technical discussion.

**NOT verified from this session / screenshots alone**

- Click transcript → seek / autoplay behavior  
- Playback → active utterance + auto-scroll  
- Manual scroll break/resume  
- Scrub → transcript jump  

Keep sync details as **UNKNOWN / HYPOTHESIS** until dedicated testing.

---

## 11. Ask Fathom — two scopes

**VERIFIED**

| Context | Scope control | Example suggested prompts |
|---------|---------------|---------------------------|
| My Meetings | `My Calls` | Things I promised I'd do by this week; Summarize my meetings from today; Any looming deadlines? |
| Meeting detail | `This Call` | Any subtext that wasn't said directly?; Any warning signs or hesitation?; Draft a follow-up email for me to send |

**UNKNOWN:** Actual answer quality, citation behavior when asking, whether “promises” prompts return structured objects or prose.

---

## 12. Code-switching / Urdu transcription (this test only)

**VERIFIED (manual observation by researcher)**

Near the end, conversation switched from primarily English to an Urdu utterance by the other participant. In this specific instance Fathom did **not** correctly preserve/transcribe that Urdu utterance; the transcript showed incorrect English/gibberish-like text reported as:

`I am Fatharikuntha guy.`

**Careful claim:** In this specific test meeting, when a participant switched from English to an Urdu utterance, Fathom produced an incorrect English/gibberish-like transcription rather than correctly transcribing that utterance as spoken.

**Do not claim from this alone:** no Urdu support, universal multilingual failure, or that language changes are never detected.

**Note on screenshots:** Current transcript screenshot documents transcript chrome and English utterances in-frame; the specific mis-transcription string is recorded here from hands-on observation. If a tighter crop of that line is captured later, attach it as `06-transcript-urdu-mistranscription.png`.

**OPPORTUNITY:** Multilingual/code-switching understanding — evaluate as secondary (see `opportunities.md`), not automatic primary differentiator.

---

## 13. What this session changed in our strategy

| Prior assumption | Revision |
|------------------|----------|
| Cross-meeting follow-through may be absent | **Revised:** cross-meeting Ask prompts about promises/deadlines are prominent on My Meetings |
| Differentiate with “what did I promise?” AI | **Weak / reject as flagship** — Fathom already markets this |
| Action items are a solved Fathom surface | **Nuanced:** Action Items tab exists, but in this meeting it disagreed with Summary Next Steps |
| Templates are low-priority chrome | **Revised upward in attention** — Enhanced Template is visible in email + summary UI; mechanics still untested |
| Capture clients might somehow be in scope | **Confirmed OUT** for 24h given assignment + observed complexity |

**Stronger differentiator candidate:** **Reliable Meeting Outcomes** — persistent typed objects (decision, commitment, risk, decision change, open question) with evidence, that do not silently disagree with the summary.

---

## 14. Unknowns still remaining (high value only)

1. Playback ↔ transcript synchronization contract  
2. Summary template switch / customize / regenerate behavior  
3. Highlights create + aftermath  
4. Clip create + share URL  
5. External recipient share (incognito)  
6. Search: in-transcript (chrome seen) vs global; result deep-link behavior  
7. Ask Fathom answer quality + citations (both scopes) — optional if we stub Ask  
8. Long-meeting density (~1h / multi-participant) for seed design  

See remaining-recon ordering in the final handoff / `README.md`.

---

## Revision log

| Date | Change |
|------|--------|
| 2026-10-01 | Initial write-up from session 01 + five renamed screenshots |

---

## Final freeze observations (2026-10-01)

### Playback ↔ transcript synchronization — VERIFIED

Manual testing confirmed:

- While audio plays, Fathom can follow the corresponding transcript position.
- Transcript exposes a **Follow playback** affordance.
- Following playback keeps transcript synced to current audio position.
- Seeking player forward/back then resuming highlights the matching transcript content.
- Active utterance receives visual highlighting.
- Clicking a transcript line seeks/plays audio at that timestamp.

**P0 sync contract (frozen):**

PLAYER → TRANSCRIPT: current time → active utterance highlight; Follow playback scrolls active into view; seek updates active location.  
TRANSCRIPT → PLAYER: click utterance → seek (+ play from timestamp).  
FOLLOW MODE: visible Follow playback control.

R1 marked **sufficiently VERIFIED**. No further edge-case reverse-engineering.

### Web application parity — VERIFIED

Fathom's **web application** exposes essentially the same core meeting-review UI as desktop for My Meetings, meeting detail, Summary, Action Items, and Transcript.

**Implication:** Reconstruction ships as a **deployed web app**. Desktop shell is OUT.

### Speaker-turn / utterance grouping — VERIFIED (this meeting only)

In this specific test meeting, we observed at least one imperfect speaker-turn/utterance grouping around a short interjection and following responses (approx. order: other "OK" → Daniyal question with "why" → other response/reason). Content belonging to adjacent turns appeared grouped/reordered in a confusing way.

Do **not** generalize to “Fathom diarization is bad.” Secondary evidence only. We are not building production diarization.

### Recon FROZEN

No further research on long meetings, highlights, clips, templates depth, Ask quality, calendar, onboarding, settings, multilingual, desktop, or extension. Scope freeze → implementation.
