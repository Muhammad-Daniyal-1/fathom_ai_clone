# Opportunities — re-ranked after session 01

**Evidence:** [`verified-session-01.md`](./verified-session-01.md), screenshots `01`–`05`.  
**Cap:** 5 opportunities → **one** primary differentiator.  
**Constraint:** Product must still read as a Fathom-class AI meeting notetaker first.

---

## Ranking summary

| Rank | Opportunity | Role |
|------|-------------|------|
| **1 (PRIMARY)** | Reliable Meeting Outcomes | Flagship improvement |
| 2 | Thin cross-meeting structured follow-through | Amplifier only if P0 solid |
| 3 | Trust/citations consistency (summary ↔ outcomes ↔ evidence) | Fold into #1 |
| 4 | Multilingual / code-switching understanding | Secondary P1/P2 |
| 5 | Long-meeting retrieval / share polish | Pending more recon; not flagship yet |

**Rejected as flagship:** “Ask AI what I promised” — Fathom already surfaces that on My Meetings.

---

## Opportunity 1 — Reliable Meeting Outcomes (PRIMARY)

### Verified problem / evidence

In **this** test meeting:

- Enhanced Summary + Next Steps clearly contained commitments, a decision change, a stack decision, a risk, and an open payment-provider question ([`01`](./screenshots/01-email-post-meeting.png), [`03`](./screenshots/03-meeting-detail-summary.png)).  
- Dedicated **Action Items** tab and email ACTION ITEMS both said **no action items detected** ([`04`](./screenshots/04-meeting-detail-action-items-empty.png), [`01`](./screenshots/01-email-post-meeting.png)).  

Also VERIFIED: Ask Fathom advertises cross-meeting promise/deadline questions ([`02`](./screenshots/02-home-my-meetings-ask-fathom.png)) — so chat-about-promises is not a white space.

### User consequence

Users can read a strong narrative summary and still lack a trustworthy, inspectable list of what was decided / promised / still open. Surfaces disagree. Accountability becomes “ask the AI again” instead of “open the outcome.”

### Proposed improvement

First-class **Meeting Outcomes** objects inside meeting detail (alongside, not replacing, Summary / Action Items / Transcript):

| Type | Example from our test |
|------|------------------------|
| DECISION | Use PostgreSQL instead of MongoDB |
| COMMITMENT | Daniyal — analytics dashboard — Friday |
| COMMITMENT | Sara — API credentials — tomorrow 5 PM |
| RISK | Payment integration may delay launch |
| DECISION_CHANGE | Beta launch Oct 15 → Oct 22 |
| OPEN_QUESTION | Which payment provider? |

Each object: type, description, owner?, due?, status?, source meeting, timestamp, transcript evidence (click → seek). Optionally confidence.

UX answers without prompting:

- What was decided?  
- What did we promise?  
- What is at risk?  
- What is unresolved?  
- What changed?  

### Demo value

**Very high.** Show Summary Next Steps and empty Action Items as the Fathom-like failure mode we observed, then show Outcomes populated with evidence jumps — or simply show Outcomes as the reliable layer judges can trust.

### Implementation complexity (24h)

**Medium.** Seed deterministic outcomes JSON tied to transcript timestamps; build a calm Outcomes panel; wire click→seek. No live extractor required for demo.

### Distraction risk

**Low–Medium** if Outcomes live *inside* meeting detail. **High** if we pivot a full PM tool. Mitigate by keeping Fathom tab IA recognizable and Outcomes as the thoughtful addition.

### Why this beats weaker framings

| Weak framing | Why reject |
|--------------|------------|
| “We extract action items; Fathom only summarizes” | False — Fathom summarized next steps well here |
| “We add Ask: what did I promise?” | Fathom already promotes that |
| “Fathom’s action items are broken” | Overgeneralizes one meeting |

**Accurate framing:** Fathom can narrate outcomes in summary/Ask; we make outcomes **persistent, typed, consistent, and evidence-linked** so review does not depend on prompt luck or contradictory tabs.

---

## Opportunity 2 — Cross-meeting structured follow-through

### Verified problem / evidence

Ask Fathom `My Calls` suggests promise/deadline questions (**verified chrome**). Whether results are durable structured objects with status is **UNKNOWN** (answers not tested).

### User consequence

Even good single-meeting notes fail when work spans meetings; users re-ask AI or lose threads.

### Proposed improvement

Thin **Needs Attention / Outcomes** view: open commitments due soon + key decisions/risks/open questions across seeded meetings; each row deep-links to evidence.

### Demo value

**High** with a 2–3 meeting project narrative.

### Complexity

**Medium–High.**

### Distraction risk

**High** if built before meeting-detail fidelity. Keep **P1 amplifier**.

### Relation to primary

Only ships after Outcomes objects exist; same data model.

---

## Opportunity 3 — Citation / consistency discipline (fold into #1)

### Verified problem / evidence

Summary shows at least one takeaway with a play/jump affordance (**verified** in [`03`](./screenshots/03-meeting-detail-summary.png)). Action Items empty while Next Steps full (**verified**). Consistency across artifacts is the gap.

### Proposed improvement

Every Outcome and every important summary bullet that we show in P0 shares the same evidence pointer. Action Items tab in *our* product should not contradict Outcomes (either populate from same objects or clearly derive from them).

### Demo value

**High** as craft; weaker alone as a slogan.

### Complexity

**Low–Medium** with seeded IDs.

### Distraction risk

**Low** — this is quality bar for Outcomes, not a second feature.

---

## Opportunity 4 — Multilingual / code-switching understanding

### Verified problem / evidence

In **this** meeting, an English→Urdu switch produced incorrect English/gibberish-like transcript text (`I am Fatharikuntha guy.`) — **manual VERIFIED**, single instance.

### User consequence

Global teams lose meaning and downstream extraction when code-switching fails.

### Proposed improvement

Preserve original mixed text; detect languages; optional translation; still extract outcomes from meaning.

### Demo value

**Medium** for international story; easy to look gimmicky if core clone is weak.

### Complexity

**High** for real ASR; **Medium** for a seeded demo utterance with translation UI.

### Distraction risk

**High** as P0. Rank **P1/P2 secondary**.

---

## Opportunity 5 — Long-meeting retrieval / share (pending evidence)

### Verified problem / evidence

**Not yet tested** at ~1h / ~8 participants. Share button exists; recipient UX unknown. Transcript search chrome exists; global search unknown.

### Proposed improvement

Only if remaining recon shows painful retrieval or weak external share: chapters/markers and/or outsider-optimized share of an Outcome+evidence window.

### Demo value

Potentially high — **unproven**.

### Complexity

Medium.

### Distraction risk

Medium. Do not promote to primary without evidence.

---

## Primary differentiator (revised)

**One sentence:**  
Make meeting agreements into reliable, typed, evidence-linked Meeting Outcomes — so decisions, commitments, risks, changes, and open questions stay consistent and inspectable without depending on Ask Fathom prompts.

**Short explanation:**  
Session 01 showed Fathom already strong at Enhanced Summary and already advertising cross-meeting promise/deadline questions, while the dedicated Action Items channel can disagree with that summary on the same meeting. Our improvement is not “more AI chat” or “Fathom can’t summarize.” It is **reliability and structure**: first-class outcomes with owners/dues/status/evidence that power Action Items and (optionally) a thin Needs Attention view — inside a product that still looks and feels like Fathom.

**Kill / pivot criteria**

- If deeper recon shows Fathom already has durable typed outcomes + consistent Action Items + evidence everywhere, pivot toward long-meeting retrieval + share.  
- If Ask Fathom already returns structured, persistent, status-bearing commitment objects across meetings, narrow our bet to **consistency + decision-change objects + evidence UX**, not “we invented follow-through.”

**Status:** Leading candidate after session 01 — still confirm remaining recon before architecture freeze.

---

## Revision log

| Date | Change |
|------|--------|
| 2026-09-30 | Pre-recon provisional “execution intelligence” |
| 2026-10-01 | Re-ranked using Action Items↔Summary inconsistency + Ask Fathom My Calls evidence; primary = Reliable Meeting Outcomes |
