"use client";

import { formatTimestamp } from "@/data/meetings";
import { outcomeMeta } from "@/lib/brand";
import { getParticipant } from "@/data/meetings";
import { usePlayback } from "@/lib/playback-context";
import type { MeetingOutcome } from "@/data/types";

function EvidenceButton({
  utteranceId,
  label = "Evidence",
}: {
  utteranceId: string;
  label?: string;
}) {
  const { meeting, jumpToEvidence } = usePlayback();
  const u = meeting.transcript.find((x) => x.id === utteranceId);
  if (!u) return null;
  return (
    <button
      type="button"
      onClick={() => jumpToEvidence(utteranceId)}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/[0.03] px-2.5 py-1 text-[11px] text-[var(--accent)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
    >
      <span aria-hidden>▶</span>
      {label} · {formatTimestamp(u.startTime)}
    </button>
  );
}

function OutcomeCard({ outcome }: { outcome: MeetingOutcome }) {
  const meta = outcomeMeta[outcome.type];
  const owner = outcome.ownerId ? getParticipant(outcome.ownerId) : undefined;

  return (
    <article className="rounded-xl border border-[var(--border)] bg-black/20 p-3.5">
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
          <span className="text-xs text-[var(--text-muted)]">· {outcome.dueLabel}</span>
        )}
        {outcome.status && (
          <span
            className={`ml-auto text-[10px] uppercase tracking-wide ${
              outcome.status === "done" ? "text-emerald-300" : "text-amber-200"
            }`}
          >
            {outcome.status}
          </span>
        )}
      </div>
      <h3 className="text-sm font-semibold">{outcome.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-white/75">{outcome.description}</p>
      {outcome.type === "decision_change" && (
        <p className="mt-2 text-sm">
          <span className="text-[var(--text-muted)] line-through">
            {outcome.previousValue}
          </span>
          <span className="mx-2 text-[var(--text-muted)]">→</span>
          <span className="font-medium text-white">{outcome.newValue}</span>
        </p>
      )}
      <div className="mt-3">
        <EvidenceButton utteranceId={outcome.evidenceUtteranceId} />
      </div>
    </article>
  );
}

export function OutcomesSection() {
  const { meeting } = usePlayback();
  return (
    <section className="mt-8 border-t border-[var(--border)] pt-6">
      <div className="mb-1 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Reliable Meeting Outcomes</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Persistent, typed agreements with transcript evidence — not just summary prose.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {meeting.outcomes.map((o) => (
          <OutcomeCard key={o.id} outcome={o} />
        ))}
      </div>
    </section>
  );
}

export function SummaryPanel() {
  const { meeting, jumpToEvidence } = usePlayback();
  const { summary } = meeting;

  return (
    <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto pr-1">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold">{summary.templateName}</h2>
        <button
          type="button"
          className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-muted)]"
          title="Demo uses seeded Enhanced Summary"
        >
          Copy
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
                  <li key={i} className="flex items-start justify-between gap-2 text-sm text-white/80">
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
            <li key={n.id} className="flex items-start justify-between gap-3 text-sm">
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
