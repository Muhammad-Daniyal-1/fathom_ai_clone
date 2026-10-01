"use client";

import { useMemo, useState } from "react";
import { formatTimestamp, getParticipant } from "@/data/meetings";
import { outcomeMeta } from "@/lib/brand";
import { usePlayback } from "@/lib/playback-context";
import type { MeetingOutcome } from "@/data/types";

function evidenceStrength(confidence?: number): {
  label: string;
  className: string;
} | null {
  if (confidence === undefined || Number.isNaN(confidence)) return null;
  if (confidence >= 0.85) {
    return {
      label: "High evidence",
      className: "text-emerald-300/90 ring-emerald-400/30",
    };
  }
  if (confidence >= 0.65) {
    return {
      label: "Medium evidence",
      className: "text-amber-200/90 ring-amber-400/30",
    };
  }
  return {
    label: "Low evidence",
    className: "text-orange-200/80 ring-orange-400/25",
  };
}

function snippetText(text: string, max = 110): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function evidenceIdsFor(outcome: MeetingOutcome): string[] {
  if (outcome.evidenceUtteranceIds?.length) {
    return outcome.evidenceUtteranceIds.slice(0, 3);
  }
  return outcome.evidenceUtteranceId ? [outcome.evidenceUtteranceId] : [];
}

function EvidenceChip({
  utteranceId,
  label,
}: {
  utteranceId: string;
  label?: string;
}) {
  const { meeting, jumpToEvidence } = usePlayback();
  const u = meeting.transcript.find((x) => x.id === utteranceId);
  if (!u) return null;
  const speaker = getParticipant(u.speakerId);
  return (
    <button
      type="button"
      onClick={() => jumpToEvidence(utteranceId)}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/[0.03] px-2.5 py-1 text-[11px] text-[var(--accent)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
    >
      <span aria-hidden>▶</span>
      {label
        ? `${label} · ${formatTimestamp(u.startTime)}`
        : `${speaker?.name ?? "Speaker"} · ${formatTimestamp(u.startTime)}`}
    </button>
  );
}

function ClassificationDetails({ outcome }: { outcome: MeetingOutcome }) {
  const ids = evidenceIdsFor(outcome);
  const owner = outcome.ownerId ? getParticipant(outcome.ownerId) : undefined;
  const rows: Array<{ label: string; value: string }> = [];

  if (outcome.type === "commitment") {
    rows.push({
      label: "Explicit owner",
      value: owner?.name ? `✓ ${owner.name}` : "Not stated",
    });
    rows.push({
      label: "Explicit deadline",
      value: outcome.dueLabel ? `✓ ${outcome.dueLabel}` : "Not stated",
    });
  } else if (outcome.type === "decision_change") {
    if (outcome.previousValue) {
      rows.push({ label: "Previous plan", value: outcome.previousValue });
    }
    if (outcome.newValue) {
      rows.push({ label: "New plan", value: outcome.newValue });
    }
  } else if (outcome.type === "open_question") {
    rows.push({
      label: "Status",
      value: outcome.status === "done" ? "Resolved" : "Unresolved",
    });
  } else if (outcome.type === "risk") {
    rows.push({
      label: "Status",
      value: outcome.status === "done" ? "Mitigated" : "Active",
    });
  }

  rows.push({
    label: "Transcript evidence",
    value: `${ids.length} source${ids.length === 1 ? "" : "s"}`,
  });

  return (
    <ul className="mt-2 space-y-1 text-[11px] text-[var(--text-muted)]">
      {rows.map((r) => (
        <li key={r.label} className="flex justify-between gap-3">
          <span>{r.label}</span>
          <span className="text-right text-white/70">{r.value}</span>
        </li>
      ))}
    </ul>
  );
}

function OutcomeCard({ outcome }: { outcome: MeetingOutcome }) {
  const { meeting, jumpToEvidence } = usePlayback();
  const [open, setOpen] = useState(false);
  const meta = outcomeMeta[outcome.type];
  const owner = outcome.ownerId ? getParticipant(outcome.ownerId) : undefined;
  const strength = evidenceStrength(outcome.confidence);
  const ids = evidenceIdsFor(outcome);
  const primary = meeting.transcript.find((u) => u.id === ids[0]);
  const isChange = outcome.type === "decision_change";

  return (
    <article
      className={`rounded-xl border bg-black/20 p-3.5 ${
        isChange
          ? "border-[var(--accent)]/40 sm:col-span-2"
          : "border-[var(--border)]"
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${meta.className}`}
        >
          {meta.label}
        </span>
        {owner && (
          <span className="text-xs text-[var(--text-muted)]">{owner.name}</span>
        )}
        {outcome.dueLabel && (
          <span className="text-xs text-[var(--text-muted)]">
            · {outcome.dueLabel}
          </span>
        )}
        {outcome.status && (
          <span
            className={`text-[10px] uppercase tracking-wide ${
              outcome.status === "done" ? "text-emerald-300" : "text-amber-200"
            }`}
          >
            {outcome.status}
          </span>
        )}
        {strength && (
          <span
            className={`ml-auto rounded-full px-2 py-0.5 text-[10px] ring-1 ${strength.className}`}
            title={
              outcome.confidence !== undefined
                ? `AI confidence ${(outcome.confidence * 100).toFixed(0)}% — evidence strength estimate, not objective truth`
                : undefined
            }
          >
            {strength.label}
          </span>
        )}
      </div>

      <h3 className="text-sm font-semibold">{outcome.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-white/75">
        {outcome.description}
      </p>

      {isChange && (outcome.previousValue || outcome.newValue) && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-black/30 px-4 py-3">
          <div className="min-w-[7rem]">
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
              Previous
            </div>
            <div className="mt-1 text-lg font-semibold tracking-tight text-white/45 line-through decoration-white/30">
              {outcome.previousValue || "—"}
            </div>
          </div>
          <div className="text-xl text-[var(--accent)]" aria-hidden>
            →
          </div>
          <div className="min-w-[7rem]">
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
              New decision
            </div>
            <div className="mt-1 text-lg font-semibold tracking-tight text-white">
              {outcome.newValue || "—"}
            </div>
          </div>
        </div>
      )}

      {ids.length > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 text-[11px] text-[var(--text-muted)]">
            Evidence
          </div>
          <div className="flex flex-wrap gap-2">
            {ids.map((eid, i) => (
              <EvidenceChip
                key={eid}
                utteranceId={eid}
                label={
                  isChange && ids.length > 1
                    ? i === 0
                      ? "Previous plan"
                      : i === ids.length - 1
                        ? "Changed decision"
                        : undefined
                    : undefined
                }
              />
            ))}
          </div>
          {primary && (
            <blockquote className="mt-3 border-l-2 border-[var(--accent)]/40 pl-3 text-[13px] leading-relaxed text-white/70">
              “{snippetText(primary.text)}”
              <button
                type="button"
                onClick={() => jumpToEvidence(primary.id)}
                className="mt-1 block text-[11px] text-[var(--accent)] hover:underline"
              >
                View in transcript
              </button>
            </blockquote>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-3 text-[11px] text-[var(--text-muted)] hover:text-white"
      >
        {open ? "Hide evidence details" : "Evidence details"}
      </button>
      {open && <ClassificationDetails outcome={outcome} />}
    </article>
  );
}

export function OutcomesSection() {
  const { meeting } = usePlayback();
  const ordered = useMemo(() => {
    const rank: Record<string, number> = {
      decision_change: 0,
      decision: 1,
      commitment: 2,
      risk: 3,
      open_question: 4,
    };
    return [...meeting.outcomes].sort(
      (a, b) => (rank[a.type] ?? 9) - (rank[b.type] ?? 9),
    );
  }, [meeting.outcomes]);

  return (
    <section className="mt-8 border-t border-[var(--border)] pt-6">
      <div className="mb-1 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Reliable Meeting Outcomes</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Typed outcomes you can trace — each one grounded in transcript
            evidence.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {ordered.map((o) => (
          <OutcomeCard key={o.id} outcome={o} />
        ))}
      </div>
    </section>
  );
}

export function SummaryPanel() {
  const { meeting, jumpToEvidence } = usePlayback();
  const { summary } = meeting;
  const [copied, setCopied] = useState(false);

  async function copySummary() {
    const lines: string[] = [
      meeting.title,
      "",
      "Purpose",
      summary.purpose,
      "",
      "Key Takeaways",
      ...(summary.takeaways?.map((t) => `• ${t.label ? `${t.label}: ` : ""}${t.text}`) ??
        []),
      "",
      "Next Steps",
      ...(summary.nextSteps?.map((n) => `• ${n.label ? `${n.label}: ` : ""}${n.text}`) ??
        []),
      "",
      "Outcomes",
      ...meeting.outcomes.map(
        (o) =>
          `• [${o.type}] ${o.title}${o.ownerId ? ` — ${getParticipant(o.ownerId)?.name ?? ""}` : ""}${o.dueLabel ? ` · ${o.dueLabel}` : ""}`,
      ),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto pr-1">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold">{summary.templateName}</h2>
        <button
          type="button"
          onClick={() => void copySummary()}
          className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-white"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>

      <section className="mb-5">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Meeting Purpose
        </h3>
        <p className="text-sm leading-relaxed text-white/85">{summary.purpose}</p>
      </section>

      <section className="mb-5">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Key Takeaways
        </h3>
        <ul className="space-y-2">
          {summary.takeaways?.map((t) => (
            <li
              key={t.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-transparent px-2 py-1.5 hover:border-[var(--border)] hover:bg-white/[0.02]"
            >
              <p className="text-sm leading-relaxed">
                {t.label && <strong className="text-white">{t.label}: </strong>}
                <span className="text-white/80">{t.text}</span>
              </p>
              {t.evidenceUtteranceId && (
                <button
                  type="button"
                  onClick={() => jumpToEvidence(t.evidenceUtteranceId!)}
                  className="shrink-0 rounded-full p-1.5 text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                  aria-label="Jump to evidence"
                >
                  ▶
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-5">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Topics
        </h3>
        <div className="space-y-4">
          {summary.topics.map((topic) => (
            <div key={topic.id}>
              <h4 className="mb-1 text-sm font-medium">{topic.title}</h4>
              <ul className="space-y-1.5 pl-1">
                {topic.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-start justify-between gap-2 text-sm text-white/80"
                  >
                    <span>· {b.text}</span>
                    {b.evidenceUtteranceId && (
                      <button
                        type="button"
                        onClick={() => jumpToEvidence(b.evidenceUtteranceId!)}
                        className="shrink-0 text-[var(--accent)]"
                        aria-label="Jump to evidence"
                      >
                        ▶
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-2">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Next Steps
        </h3>
        <ul className="space-y-2">
          {summary.nextSteps?.map((n) => (
            <li
              key={n.id}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <p>
                {n.label && <strong>{n.label}: </strong>}
                <span className="text-white/80">{n.text}</span>
              </p>
              {n.evidenceUtteranceId && (
                <button
                  type="button"
                  onClick={() => jumpToEvidence(n.evidenceUtteranceId!)}
                  className="text-[var(--accent)]"
                  aria-label="Jump to evidence"
                >
                  ▶
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <OutcomesSection />
    </div>
  );
}
