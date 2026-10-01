"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  meetings,
  getParticipant,
  formatTimestamp,
  globalAskSuggestions,
  registerParticipants,
} from "@/data/meetings";
import { productName } from "@/lib/brand";
import { searchMeetings } from "@/lib/search";
import { loadGeneratedMeetings } from "@/lib/generated-meetings";
import type { Meeting, MeetingOutcome } from "@/data/types";

function WaveThumb({ hue, durationSec }: { hue: number; durationSec: number }) {
  return (
    <div
      className="relative h-[72px] w-[112px] shrink-0 overflow-hidden rounded-lg"
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 55% 42%), hsl(${(hue + 40) % 360} 50% 28%))`,
      }}
    >
      <div className="waveform absolute inset-3 opacity-80" />
      <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
        {formatTimestamp(durationSec)}
      </span>
    </div>
  );
}

interface AttentionItem {
  meetingId: string;
  meetingTitle: string;
  outcome: MeetingOutcome;
  kind: "commitment" | "risk" | "open_question";
}

function collectAttention(all: Meeting[]): AttentionItem[] {
  const items: AttentionItem[] = [];
  for (const m of all) {
    for (const o of m.outcomes) {
      if (o.status === "done") continue;
      if (
        o.type === "commitment" ||
        o.type === "risk" ||
        o.type === "open_question"
      ) {
        items.push({
          meetingId: m.id,
          meetingTitle: m.title,
          outcome: o,
          kind: o.type,
        });
      }
    }
  }
  const rank = { commitment: 0, risk: 1, open_question: 2 } as const;
  return items.sort((a, b) => rank[a.kind] - rank[b.kind]).slice(0, 5);
}

export default function HomePage() {
  const [askAnswer, setAskAnswer] = useState<string | null>(null);
  const [askPrompt, setAskPrompt] = useState("");
  const [query, setQuery] = useState("");
  const [generated, setGenerated] = useState<Meeting[]>([]);

  useEffect(() => {
    const stored = loadGeneratedMeetings();
    for (const s of stored) registerParticipants(s.participants);
    setGenerated(stored.map((s) => s.meeting));
  }, []);

  const allMeetings = useMemo(
    () => [...generated, ...meetings],
    [generated],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Meeting[]>();
    for (const m of allMeetings) {
      const list = map.get(m.groupLabel) ?? [];
      list.push(m);
      map.set(m.groupLabel, list);
    }
    return Array.from(map.entries());
  }, [allMeetings]);

  const hits = useMemo(
    () => searchMeetings(query, generated),
    [query, generated],
  );

  const attention = useMemo(
    () => collectAttention(allMeetings),
    [allMeetings],
  );

  const attentionCounts = useMemo(() => {
    const c = { commitment: 0, risk: 0, open_question: 0 };
    for (const m of allMeetings) {
      for (const o of m.outcomes) {
        if (o.status === "done") continue;
        if (o.type === "commitment") c.commitment += 1;
        if (o.type === "risk") c.risk += 1;
        if (o.type === "open_question") c.open_question += 1;
      }
    }
    return c;
  }, [allMeetings]);

  function runAsk(prompt: string, answer: string) {
    setAskPrompt(prompt);
    setAskAnswer(answer);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col px-4 py-5 md:px-6">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-sm font-bold text-white">
            B
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight">
              {productName}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              From conversations to outcomes you can trace
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/analyze"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:brightness-110"
          >
            Analyze Meeting
          </Link>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across meetings…"
            className="hidden w-56 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 text-sm outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] sm:block md:w-64"
          />
        </div>
      </header>

      {query.trim() && (
        <div className="mb-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Search results
          </div>
          {hits.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No matches.</p>
          ) : (
            <ul className="space-y-2">
              {hits.map((h) => (
                <li key={`${h.meetingId}-${h.utteranceId}-${h.snippet.slice(0, 12)}`}>
                  <Link
                    href={`/meetings/${h.meetingId}?u=${h.utteranceId}`}
                    className="block rounded-xl border border-transparent px-3 py-2 hover:border-[var(--border)] hover:bg-white/[0.03]"
                  >
                    <div className="text-sm font-medium">{h.meetingTitle}</div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {h.speakerName} · {formatTimestamp(h.timestamp)}
                    </div>
                    <div className="mt-1 line-clamp-2 text-sm text-white/80">
                      {h.snippet}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]/80 p-5 backdrop-blur">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              My Meetings
            </h1>
            <Link
              href="/analyze"
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-white/85 hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] sm:hidden"
            >
              Analyze Meeting
            </Link>
          </div>
          <div className="space-y-6">
            {grouped.map(([group, items]) => (
              <div key={group}>
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  {group}
                </div>
                <ul className="space-y-2">
                  {items.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/meetings/${m.id}`}
                        className="flex gap-4 rounded-xl border border-transparent p-3 transition hover:border-[var(--border)] hover:bg-white/[0.03]"
                      >
                        <WaveThumb
                          hue={m.waveformHue}
                          durationSec={m.durationSec}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="truncate font-medium">{m.title}</div>
                            {!m.audioSrc && (
                              <span className="shrink-0 rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
                                AI
                              </span>
                            )}
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--text-muted)]">
                            {m.description}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex -space-x-1.5">
                              {m.participantIds.map((pid) => {
                                const p = getParticipant(pid);
                                return (
                                  <span
                                    key={pid}
                                    title={p?.name}
                                    className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--bg-elevated)] bg-[#2a3140] text-[10px] font-semibold"
                                  >
                                    {p?.initials ?? "?"}
                                  </span>
                                );
                              })}
                            </div>
                            <span className="text-xs text-[var(--text-muted)]">
                              {m.dateLabel}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-5">
            <div className="mb-1 text-xs font-semibold tracking-[0.14em] text-[var(--text-muted)]">
              NEEDS ATTENTION
            </div>
            <p className="mb-3 text-[11px] text-[var(--text-muted)]">
              {attentionCounts.commitment} open commitment
              {attentionCounts.commitment === 1 ? "" : "s"}
              {" · "}
              {attentionCounts.open_question} unresolved
              {" · "}
              {attentionCounts.risk} risk
              {attentionCounts.risk === 1 ? "" : "s"}
            </p>
            <ul className="space-y-2">
              {attention.map((a) => {
                const owner = a.outcome.ownerId
                  ? getParticipant(a.outcome.ownerId)
                  : undefined;
                return (
                  <li key={`${a.meetingId}-${a.outcome.id}`}>
                    <Link
                      href={`/meetings/${a.meetingId}?u=${a.outcome.evidenceUtteranceId}`}
                      className="block rounded-xl border border-[var(--border)] bg-black/20 px-3 py-2.5 hover:border-[var(--accent)]/50"
                    >
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
                        <span>{a.kind.replace("_", " ")}</span>
                        <span className="truncate normal-case tracking-normal text-white/40">
                          {a.meetingTitle}
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-medium">
                        {a.outcome.title}
                      </div>
                      <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                        {owner?.name ??
                          (a.kind === "commitment" ? "Unassigned" : null)}
                        {a.outcome.dueLabel
                          ? `${owner || a.kind === "commitment" ? " · " : ""}${a.outcome.dueLabel}`
                          : ""}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex flex-1 flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-lg">✦</span>
              <h2 className="text-sm font-semibold tracking-[0.12em]">
                ASK BRIEF
              </h2>
            </div>
            <div className="scrollbar-thin min-h-[140px] flex-1 overflow-y-auto rounded-xl bg-black/20 p-3 text-sm leading-relaxed text-white/85">
              {askAnswer ? (
                <div>
                  <div className="mb-2 text-xs text-[var(--text-muted)]">
                    You asked
                  </div>
                  <div className="mb-3 font-medium">{askPrompt}</div>
                  <div className="text-[var(--text-muted)]">Brief</div>
                  <p className="mt-1 whitespace-pre-wrap">{askAnswer}</p>
                </div>
              ) : (
                <p className="text-[var(--text-muted)]">
                  Ask across your calls — or open a meeting for live grounded
                  answers.
                </p>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {globalAskSuggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => runAsk(s.prompt, s.answer)}
                  className="rounded-full border border-[var(--border)] bg-white/[0.03] px-3 py-1.5 text-left text-xs text-white/80 transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
                >
                  {s.prompt}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-full border border-[var(--border)] bg-black/25 px-3 py-2">
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
                My Calls
              </span>
              <input
                value={askPrompt}
                onChange={(e) => setAskPrompt(e.target.value)}
                placeholder="Ask anything…"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  const match = globalAskSuggestions.find(
                    (s) =>
                      s.prompt.toLowerCase() === askPrompt.trim().toLowerCase(),
                  );
                  runAsk(
                    askPrompt || "Ask anything",
                    match?.answer ??
                      "Open a meeting and use Ask This Call for live grounded answers.",
                  );
                }}
              />
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-white"
                onClick={() => {
                  const match = globalAskSuggestions.find(
                    (s) =>
                      s.prompt.toLowerCase() === askPrompt.trim().toLowerCase(),
                  );
                  runAsk(
                    askPrompt || "Ask anything",
                    match?.answer ??
                      "Open a meeting and use Ask This Call for live grounded answers.",
                  );
                }}
                aria-label="Send"
              >
                ↑
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
