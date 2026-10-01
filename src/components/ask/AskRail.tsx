"use client";

import { useState, useTransition } from "react";
import { formatTimestamp, getParticipant } from "@/data/meetings";
import { usePlayback } from "@/lib/playback-context";
import { getGeneratedMeeting } from "@/lib/generated-meetings";
import type { CanonicalAnalysis, ParsedUtterance } from "@/lib/ai/schemas";

export function AskRail() {
  const { meeting, jumpToEvidence } = usePlayback();
  const [prompt, setPrompt] = useState("");
  const [active, setActive] = useState<{
    prompt: string;
    answer: string;
    evidenceUtteranceIds?: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runDeterministic(
    p: string,
    answer: string,
    evidenceUtteranceIds?: string[],
  ) {
    setPrompt(p);
    setError(null);
    setActive({ prompt: p, answer, evidenceUtteranceIds });
  }

  function buildAskPayload(): {
    utterances: ParsedUtterance[];
    outcomes: CanonicalAnalysis["outcomes"];
  } {
    const stored = getGeneratedMeeting(meeting.id);
    if (stored) {
      return {
        utterances: stored.utterances,
        outcomes: stored.analysis.outcomes,
      };
    }
    return {
      utterances: meeting.transcript.map((u) => ({
        id: u.id,
        speaker: getParticipant(u.speakerId)?.name ?? u.speakerId,
        timestamp: formatTimestamp(u.startTime),
        startTime: u.startTime,
        text: u.text,
      })),
      outcomes: meeting.outcomes.map((o) => ({
        type: o.type,
        title: o.title,
        description: o.description,
        owner: o.ownerId
          ? (getParticipant(o.ownerId)?.name ?? null)
          : null,
        due: o.dueLabel ?? null,
        status: o.status ?? null,
        confidence: o.confidence ?? 0.9,
        evidenceIds: o.evidenceUtteranceIds?.length
          ? o.evidenceUtteranceIds
          : [o.evidenceUtteranceId],
        previousValue: o.previousValue ?? null,
        newValue: o.newValue ?? null,
      })),
    };
  }

  function askLive(question: string) {
    const q = question.trim();
    if (!q || isPending) return;
    setPrompt(q);
    setError(null);
    startTransition(async () => {
      try {
        const { utterances, outcomes } = buildAskPayload();
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: q,
            transcriptUtterances: utterances,
            outcomes,
          }),
        });
        const data = (await res.json()) as {
          error?: string;
          answer?: string;
          evidenceIds?: string[];
        };
        if (!res.ok || !data.answer) {
          const match = meeting.askSuggestions.find(
            (s) => s.prompt.toLowerCase() === q.toLowerCase() && s.answer,
          );
          if (match?.answer) {
            setActive({
              prompt: q,
              answer: match.answer,
              evidenceUtteranceIds: match.evidenceUtteranceIds,
            });
            setError(
              data.error
                ? `Live Ask unavailable. Showing seeded answer.`
                : null,
            );
            return;
          }
          throw new Error(data.error || "Ask failed");
        }
        setActive({
          prompt: q,
          answer: data.answer,
          evidenceUtteranceIds: data.evidenceIds,
        });
      } catch {
        const match = meeting.askSuggestions.find(
          (s) => s.prompt.toLowerCase() === q.toLowerCase() && s.answer,
        );
        if (match?.answer) {
          setActive({
            prompt: q,
            answer: match.answer,
            evidenceUtteranceIds: match.evidenceUtteranceIds,
          });
          setError("Live Ask unavailable. Showing seeded answer.");
          return;
        }
        setError("Could not reach Ask AI. Try again in a moment.");
      }
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2 flex items-center gap-2">
        <span>✦</span>
        <h2 className="text-xs font-semibold tracking-[0.14em]">ASK BRIEF</h2>
      </div>
      <div className="scrollbar-thin mb-3 min-h-[120px] flex-1 overflow-y-auto rounded-xl bg-black/20 p-3 text-sm leading-relaxed">
        {isPending ? (
          <p className="text-[var(--text-muted)]">Reading this call…</p>
        ) : active ? (
          <div>
            <div className="text-xs text-[var(--text-muted)]">You</div>
            <div className="mb-3 font-medium">{active.prompt}</div>
            <div className="text-xs text-[var(--text-muted)]">Brief</div>
            <p className="mt-1 text-white/85">{active.answer}</p>
            {active.evidenceUtteranceIds &&
              active.evidenceUtteranceIds.length > 0 && (
                <div className="mt-3">
                  <div className="mb-1.5 text-[11px] text-[var(--text-muted)]">
                    Sources
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {active.evidenceUtteranceIds.map((id) => {
                      const u = meeting.transcript.find((x) => x.id === id);
                      if (!u) return null;
                      const speaker = getParticipant(u.speakerId);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => jumpToEvidence(id)}
                          className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                        >
                          ▶ {speaker?.name ?? "Speaker"} ·{" "}
                          {formatTimestamp(u.startTime)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>
        ) : (
          <p className="text-[var(--text-muted)]">
            Ask about this call — decisions, risks, and follow-ups.
          </p>
        )}
        {error && <p className="mt-3 text-xs text-amber-200/90">{error}</p>}
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {meeting.askSuggestions.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              if (s.answer) {
                runDeterministic(s.prompt, s.answer, s.evidenceUtteranceIds);
              } else {
                askLive(s.prompt);
              }
            }}
            className="rounded-full border border-[var(--border)] bg-white/[0.03] px-3 py-1.5 text-left text-xs text-white/80 hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
          >
            {s.prompt}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-black/25 px-3 py-2">
        <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
          This Call
        </span>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask anything…"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            askLive(prompt || "Ask anything");
          }}
        />
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] disabled:opacity-40"
          aria-label="Send"
          disabled={isPending}
          onClick={() => askLive(prompt || "Ask anything")}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
