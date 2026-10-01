# Brief — AI meeting notetaker (Fathom-class reconstruction)

**Brief** is a 24-hour hackathon rebuild of an AI meeting notetaker in the spirit of [Fathom](https://fathom.video), with one deliberate product improvement:

## Reliable Meeting Outcomes

Instead of letting important agreements live only inside AI summary prose, Brief represents them as **persistent, typed, evidence-linked objects**:

- Decision  
- Commitment (owner · due · status)  
- Risk  
- Decision change  
- Open question  

Clicking **Evidence** opens the Transcript tab, seeks audio to the source utterance, highlights it, and scrolls it into view.

Action Items are derived from the **same seeded source** as Outcomes, so the surfaces stay consistent.

---

## What we intentionally stubbed

The assignment allows faking the meeting-recording bot. After hands-on recon, we **did not build**:

- Desktop app / Chrome extension / live Meet·Zoom·Teams capture  
- Calendar OAuth / onboarding permissions theater  
- Production ASR / diarization / live LLM summarization  

We invested that time in the **post-meeting review loop**: library, detail, player ↔ transcript sync, Enhanced Summary, Action Items, Outcomes, Ask (deterministic), search, and public share.

Research notes: [`recon/`](./recon/) (frozen after session 01).

---

## Demo walkthrough (~3–5 min)

1. Open **My Meetings** — three seeded meetings.  
2. Open **Atlas Dashboard Weekly Sync**.  
3. Skim **Enhanced Summary**.  
4. Open **Action Items** (populated, consistent).  
5. Scroll to **Reliable Meeting Outcomes** on the Summary tab.  
6. Click evidence on Daniyal’s commitment → transcript + audio seek.  
7. Hit **Follow playback** and play — active utterance tracks.  
8. Ask a suggested **Ask Brief** question.  
9. Open **Share** (`/share/atlas-weekly`) in an incognito window.

---

## Stack

- Next.js 15 (App Router) · TypeScript · Tailwind CSS v4  
- Deterministic TypeScript seed data (`src/data/meetings.ts`)  
- No database · no ORM · no vector/RAG stack · no LangChain  

```bash
npm install
npm run dev
# http://localhost:3000
```

```bash
npm run build && npm start
```

---

## Agent capture (assignment requirement)

Cursor hooks capture prompts/responses into [`.agent-logs/`](./.agent-logs/).  
Verification: [`CAPTURE-TEST.md`](./CAPTURE-TEST.md).

---

## Product identity

Fathom was **reference material**, not our brand. Brief is a dark, premium meeting-intelligence UI inspired by the verified interaction model (My Meetings · Summary / Action Items / Transcript · player + Ask rail · Follow playback).
