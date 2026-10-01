"use client";

import { useState } from "react";
import { formatTimestamp } from "@/data/meetings";
import { usePlayback } from "@/lib/playback-context";

export function AskRail() {
  const { meeting, jumpToEvidence } = usePlayback();
  const [prompt, setPrompt] = useState("");
  const [active, setActive] = useState<{
    prompt: string;
    answer: string;
    evidenceUtteranceIds?: string[];
  } | null>(null);

  function run(p: string, answer: string, evidenceUtteranceIds?: string[]) {
    setPrompt(p);
    setActive({ prompt: p, answer, evidenceUtteranceIds });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2 flex items-center gap-2">
        <span>✦</span>
        <h2 className="text-xs font-semibold tracking-[0.14em]">ASK BRIEF</h2>
      </div>
      <div className="scrollbar-thin mb-3 min-h-[120px] flex-1 overflow-y-auto rounded-xl bg-black/20 p-3 text-sm leading-relaxed">
        {active ? (
          <div>
            <div className="text-xs text-[var(--text-muted)]">You</div>
            <div className="mb-3 font-medium">{active.prompt}</div>
            <div className="text-xs text-[var(--text-muted)]">Brief</div>
            <p className="mt-1 text-white/85">{active.answer}</p>
            {active.evidenceUtteranceIds && active.evidenceUtteranceIds.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {active.evidenceUtteranceIds.map((id) => {
                  const u = meeting.transcript.find((x) => x.id === id);
                  if (!u) return null;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => jumpToEvidence(id)}
                      className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                    >
                      ▶ {formatTimestamp(u.startTime)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <p className="text-[var(--text-muted)]">
            Ask about this call — decisions, risks, and follow-ups.
          </p>
        )}
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {meeting.askSuggestions.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => run(s.prompt, s.answer, s.evidenceUtteranceIds)}
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
            const match = meeting.askSuggestions.find(
              (s) => s.prompt.toLowerCase() === prompt.trim().toLowerCase(),
            );
            run(
              prompt || "Ask anything",
              match?.answer ??
                "Try a suggested question — answers are deterministic and grounded in this meeting’s outcomes.",
              match?.evidenceUtteranceIds,
            );
          }}
        />
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]"
          aria-label="Send"
          onClick={() => {
            const match = meeting.askSuggestions.find(
              (s) => s.prompt.toLowerCase() === prompt.trim().toLowerCase(),
            );
            run(
              prompt || "Ask anything",
              match?.answer ??
                "Try a suggested question — answers are deterministic and grounded in this meeting’s outcomes.",
              match?.evidenceUtteranceIds,
            );
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
