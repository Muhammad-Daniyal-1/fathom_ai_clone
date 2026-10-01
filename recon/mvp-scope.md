**SCOPE FROZEN 2026-10-01** — Sync VERIFIED; web app; Outcomes primary; capture OUT. Build now.

# MVP scope — revised after session 01

**Evidence:** [`verified-session-01.md`](./verified-session-01.md), [`opportunities.md`](./opportunities.md).  
**North star:** Recognizable Fathom reconstruction + **one** improvement: **Reliable Meeting Outcomes**.  
**Still undecided:** tech stack / DB / hosting (intentionally).

Optimize for: (1) Fathom fidelity, (2) polished UX, (3) one meaningful improvement, (4) deterministic demo, (5) ship in 24h.

---

## P0 — must work beautifully

Each item earns scarce time with one sentence.

| P0 item | Why it survives |
|---------|-----------------|
| **Seeded My Meetings library** | Without a calm, credible meeting list the product never feels like Fathom. |
| **Meeting detail IA** (back, title, meta, Share chrome, tabs Summary \| Action Items \| Transcript, persistent right rail) | Session 01 verified this as the recognizable center of gravity. |
| **Media player** (± seek, scrub, speed, time display) | Review without playback is not a meeting notetaker. |
| **Timestamped speaker transcript** | Judges expect speaker + time + text as table stakes. |
| **Playback ↔ transcript synchronization** | Highest “feels premium” interaction once contract is verified; non-negotiable for polish. |
| **In-transcript search** | Search chrome is visible on Transcript; local find is low-cost and expected. |
| **Enhanced Summary structure** (Purpose, Key Takeaways, Topics, Next Steps + copy) | Observed as the default high-quality artifact; skipping it breaks fidelity. |
| **Action Items tab** (populated from same source as Outcomes; also demo empty-state pattern) | Primary tab in Fathom IA — keep it even though Fathom left it empty in our test. |
| **Meeting Outcomes panel** (Decision, Commitment, Risk, Decision change, Open question + evidence jump) | Our single differentiator; directly answers the Summary↔Action Items consistency gap from session 01. |
| **Global / library search across seeded meetings** *(confirm deep-link in remaining recon; include in P0 unless recon proves absent)* | Multi-meeting retrieval makes the library real; implement client-side over seeds if needed. |
| **Share entry + recipient-capable share path** *(finalize shape after share recon)* | Share control is on every meeting detail header; a dead Share button fails polish — freeze exact clip-vs-full after remaining tests. |

### P0 differentiator detail — Meeting Outcomes

Deterministic seeded objects for the hero meeting (and 1–2 related meetings):

- types above  
- owner / due / status where applicable  
- transcript timestamp + click seeks player + highlights utterance  
- Action Items list **derived from** commitment/next-step outcomes so tabs cannot contradict  

### P0-thin (ship chrome + deterministic behavior; not a deep product)

| Item | Rule |
|------|------|
| **Ask Fathom — This Call** | Right-rail chrome + 2–3 canned suggested answers with optional timestamp links; do not chase open-ended LLM quality. |
| **Summary template label + 2–3 presets** | Enhanced-style default matching observed sections; switcher swaps seeded content. Full Customize editor **not** P0. Promote full switcher confidence after template recon; if recon shows huge cost, keep Enhanced-only with visible template name. |

---

## P1 — only after P0 is polished

| Item | Why wait |
|------|----------|
| **Ask Fathom — My Calls (cross-meeting)** | Prominent in Fathom, but easy to burn time; canned cross-meeting answers only after meeting detail sings. |
| **Cross-meeting Needs Attention / Outcomes** | Best amplifier of Outcomes; second surface risks PM-tool distraction if early. |
| **Highlight create + aftermath** | Brand-known in category; verify mechanics first; seed highlights can cover demo earlier. |
| **Clip create UI** (range select → share) | Valuable; may collapse into bounded share view for P0. |
| **Post-meeting email static mock** | Loop-complete storytelling; zero mail infrastructure. |
| **Chapters / long-meeting skim rail** | After we know long-meeting pain. |
| **Multilingual / code-switch demo utterance** | Real session 01 signal; secondary story only. |

---

## P2 — only if ahead

| Item | Note |
|------|------|
| Live LLM Ask Fathom | Fragile demo; prefer deterministic |
| Transcript edit / speaker rename | Low demo ROI |
| Fancy Send to… integrations | Buttons can be non-functional or copy-only |
| Waveform scrub previews | Delight |
| Custom template editor | Time sink |
| Mobile perfection | Desktop-first |
| Processing animation | Cosmetic |
| Upcoming meetings calendar rows | Cosmetic |

---

## OUT / STUBBED — deliberate non-goals

| Item | Why OUT |
|------|---------|
| **Desktop application** | Multi-client tax; capture stubbed |
| **Chrome extension** | Same |
| **Real meeting detection / recording** | Assignment allows fake; session 01 proves complexity |
| **Zoom / Meet / Teams deep integration** | Not scored vs post-meeting excellence |
| **Onboarding / permissions theater** | Real but not judged core if library works |
| **Real email delivery** | Infra distraction |
| **Production ASR / diarization pipeline** | Seed transcripts |
| **Flagship = “what did I promise?” chat** | Fathom already advertises this |
| **Full project-management SaaS** | Breaks “Fathom reconstruction + one improvement” |
| **Claiming universal Fathom Action Items failure** | One meeting ≠ product-wide bug; we fix reliability in *our* UX |
| **Auth provider / DB / Next / Supabase / etc. decisions in this phase** | Architecture after scope freeze |

---

## Explicit reconsiderations (session 01)

| Feature | Prior lean | Now | Rationale |
|---------|------------|-----|-----------|
| Summary templates | Casual P1 | **P0-thin / confirm** | Enhanced Template visible in email + UI |
| Ask AI current meeting | Uncertain | **P0-thin chrome** | Persistent right rail — missing looks unlike Fathom |
| Ask AI across meetings | Possible diff | **P1, not differentiator** | My Calls prompts already exist |
| Meeting Outcomes | Hypothesis | **P0 differentiator** | Action Items empty vs Summary full |
| Cross-meeting Needs Attention | Possible P0 | **P1** | Amplifier only |
| Multilingual | New | **P1/P2** | One code-switch failure; don’t hijack P0 |
| Highlights / clips / external share | Likely P0 bundle | **Share path P0 pending recon; highlights/clips P1 unless recon shows centrality** | Incomplete evidence |
| Post-meeting email | Ignored | **OUT send / P1–P2 mock** | Part of loop, not worth SMTP |
| Desktop + extension + recording | Stub | **OUT confirmed** | Poor 24h ROI |

---

## Seed content (P0 dependency)

Reuse Atlas Dashboard narrative from session 01 as hero seed (expanded duration OK for demo media):

- Decision: Postgres not MongoDB  
- Commitments: Daniyal / Friday; Sara / tomorrow 5pm  
- Risk: payment integration  
- Decision change: launch Oct 15 → Oct 22  
- Open question: payment provider  
- Non-technical stakeholder confusion beat (trust/communication)  
- Optional P1: one Urdu/code-switch line with translation treatment  

Add 2 satellite meetings so search + (P1) Needs Attention have a story.

---

## Demo arc (provisional)

1. My Meetings — recognizable list + Ask chrome present.  
2. Open hero meeting — Enhanced Summary skim.  
3. Action Items — show we populate consistently (contrast story optional).  
4. Outcomes — open commitment → evidence seek + transcript highlight.  
5. Transcript sync play.  
6. Search planted phrase.  
7. Share recipient path (after recon freeze).  
8. If time: Needs Attention across meetings.

---

## Definition of done (P0)

- [ ] Library feels inhabited  
- [ ] Detail IA matches verified tab/rail model  
- [ ] Player works  
- [ ] Transcript speakers/timestamps  
- [ ] Sync both directions (per verified contract)  
- [ ] Enhanced Summary sections present  
- [ ] Action Items consistent with Outcomes  
- [ ] Outcomes typed + evidence jumps  
- [ ] Transcript search works  
- [ ] Cross-meeting search works (or explicitly cut after recon)  
- [ ] Share not a dead end (shape per recon)  
- [ ] Ask This Call chrome with deterministic responses  
- [ ] No fake claims that we tested untested Fathom behaviors  

---

## Freeze gate

Do not start architecture/implementation until remaining recon in `README.md` § Remaining recon answers sync, templates depth, share/clip/highlight, search deep-link, and enough long-meeting signal for seed design.

---

## Revision log

| Date | Change |
|------|--------|
| 2026-09-30 | Initial provisional scope |
| 2026-10-01 | Rebuilt from session 01; Outcomes P0; Ask My Calls demoted; capture OUT confirmed; templates/Ask This Call as P0-thin |
