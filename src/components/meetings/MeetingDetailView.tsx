"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getParticipant } from "@/data/meetings";
import type { Meeting } from "@/data/types";
import { PlaybackProvider, usePlayback } from "@/lib/playback-context";
import { AudioPlayer } from "@/components/player/AudioPlayer";
import { TranscriptPanel } from "@/components/transcript/TranscriptPanel";
import { SummaryPanel } from "@/components/summary/SummaryPanel";
import { ActionItemsPanel } from "@/components/actions/ActionItemsPanel";
import { AskRail } from "@/components/ask/AskRail";
import { productName } from "@/lib/brand";

function buildCopyText(meeting: Meeting): string {
  const lines = [
    meeting.title,
    "",
    "Purpose",
    meeting.summary.purpose,
    "",
    "Key Takeaways",
    ...(meeting.summary.takeaways?.map(
      (t) => `• ${t.label ? `${t.label}: ` : ""}${t.text}`,
    ) ?? []),
    "",
    "Outcomes",
    ...meeting.outcomes.map(
      (o) =>
        `• [${o.type}] ${o.title}${o.dueLabel ? ` · ${o.dueLabel}` : ""}`,
    ),
  ];
  return lines.join("\n");
}

function MeetingDetailInner({ backHref }: { backHref: string }) {
  const { meeting, tab, setTab, jumpToEvidence } = usePlayback();
  const search = useSearchParams();
  const [shareNote, setShareNote] = useState<string | null>(null);
  const isGenerated = !meeting.audioSrc;

  useEffect(() => {
    const u = search.get("u");
    if (u) jumpToEvidence(u);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meeting.id]);

  const tabs = [
    { id: "summary" as const, label: "Summary" },
    { id: "actions" as const, label: "Action Items" },
    { id: "transcript" as const, label: "Transcript" },
  ];

  async function copySummaryShare() {
    try {
      await navigator.clipboard.writeText(buildCopyText(meeting));
      setShareNote("Summary copied");
      window.setTimeout(() => setShareNote(null), 1800);
    } catch {
      setShareNote("Could not copy");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col px-4 py-4 md:px-6">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <Link
            href={backHref}
            className="mb-2 inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-white"
          >
            {backHref === "/dashboard"
              ? "← Back to My Meetings"
              : "← Back to home"}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {meeting.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)]">
            <span>{meeting.dateLabel}</span>
            {isGenerated && (
              <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
                AI analyzed
              </span>
            )}
            <div className="flex -space-x-1.5">
              {meeting.participantIds.map((id) => {
                const p = getParticipant(id);
                return (
                  <span
                    key={id}
                    title={p?.name}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--bg)] bg-[#2a3140] text-[10px] font-semibold text-white"
                  >
                    {p?.initials ?? "?"}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isGenerated ? (
            <button
              type="button"
              onClick={() => void copySummaryShare()}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:brightness-110"
              title="Generated meetings are stored in this browser — copy a text summary instead of a public URL"
            >
              Copy summary
            </button>
          ) : (
            <Link
              href={`/share/${meeting.id}`}
              target="_blank"
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:brightness-110"
            >
              Share
            </Link>
          )}
          {shareNote && (
            <span className="text-[11px] text-[var(--text-muted)]">
              {shareNote}
            </span>
          )}
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.85fr)]">
        <section className="flex min-h-[70vh] flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]/80 p-4 md:p-5">
          <div className="mb-4 flex gap-4 border-b border-[var(--border)]">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`border-b-2 pb-2 text-sm font-medium transition ${
                  tab === t.id
                    ? "border-[var(--accent)] text-white"
                    : "border-transparent text-[var(--text-muted)] hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1">
            {tab === "summary" && <SummaryPanel />}
            {tab === "actions" && <ActionItemsPanel />}
            {tab === "transcript" && <TranscriptPanel />}
          </div>
        </section>

        <aside className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-4">
          <AudioPlayer />
          <AskRail />
          <p className="text-[10px] text-[var(--text-muted)]">
            {meeting.audioSrc
              ? `${productName} · From conversations to outcomes you can trace`
              : `${productName} · AI-analyzed · evidence-grounded outcomes`}
          </p>
        </aside>
      </div>
    </div>
  );
}

export function MeetingDetailView({
  meeting,
  backHref = "/dashboard",
}: {
  meeting: Meeting;
  backHref?: string;
}) {
  return (
    <PlaybackProvider meeting={meeting}>
      <MeetingDetailInner backHref={backHref} />
    </PlaybackProvider>
  );
}
