"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatTimestamp, getParticipant } from "@/data/meetings";
import { usePlayback } from "@/lib/playback-context";

export function TranscriptPanel() {
  const {
    meeting,
    activeUtteranceId,
    followPlayback,
    setFollowPlayback,
    seek,
  } = usePlayback();
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return meeting.transcript;
    return meeting.transcript.filter((u) => u.text.toLowerCase().includes(q));
  }, [meeting.transcript, query]);

  useEffect(() => {
    if (!followPlayback || !activeUtteranceId) return;
    activeRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeUtteranceId, followPlayback]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold">Transcript</h2>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFollowPlayback(true)}
            className={`rounded-full px-3 py-1 text-xs transition ${
              followPlayback
                ? "bg-[var(--accent-soft)] text-[var(--accent)] ring-1 ring-[var(--accent)]/40"
                : "border border-[var(--border)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            Follow playback
          </button>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transcript"
            className="w-44 rounded-full border border-[var(--border)] bg-black/20 px-3 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>
      <div
        ref={listRef}
        className="scrollbar-thin min-h-0 flex-1 space-y-1 overflow-y-auto pr-1"
        onWheel={() => {
          if (followPlayback) setFollowPlayback(false);
        }}
      >
        {filtered.map((u) => {
          const speaker = getParticipant(u.speakerId);
          const active = u.id === activeUtteranceId;
          return (
            <button
              key={u.id}
              type="button"
              ref={active ? activeRef : undefined}
              onClick={() => {
                setFollowPlayback(true);
                seek(u.startTime, { play: true });
              }}
              className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
                active ? "utterance-active" : "hover:bg-white/[0.03]"
              }`}
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2a3140] text-[10px] font-semibold">
                  {speaker?.initials}
                </span>
                <span className="text-sm font-medium">{speaker?.name}</span>
                <span className="text-xs text-[var(--text-muted)]">
                  {formatTimestamp(u.startTime)}
                </span>
              </div>
              <p className="pl-8 text-sm leading-relaxed text-white/85">{u.text}</p>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-sm text-[var(--text-muted)]">No matches in transcript.</p>
        )}
      </div>
    </div>
  );
}
