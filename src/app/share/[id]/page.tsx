import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatTimestamp,
  getMeeting,
  getParticipant,
} from "@/data/meetings";
import { outcomeMeta, productName } from "@/lib/brand";

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meeting = getMeeting(id);
  if (!meeting) notFound();

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 md:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-xs font-bold">
            B
          </div>
          <div>
            <div className="text-sm font-semibold">{productName}</div>
            <div className="text-[11px] text-[var(--text-muted)]">Shared meeting</div>
          </div>
        </div>
        <Link href={`/meetings/${meeting.id}`} className="text-sm text-[var(--accent)]">
          Open in app →
        </Link>
      </div>

      <article className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6">
        <h1 className="text-2xl font-semibold tracking-tight">{meeting.title}</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {meeting.dateLabel} · {formatTimestamp(meeting.durationSec)} ·{" "}
          {meeting.participantIds
            .map((pid) => getParticipant(pid)?.name)
            .filter(Boolean)
            .join(", ")}
        </p>

        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Meeting Purpose
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/85">
            {meeting.summary.purpose}
          </p>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Reliable Meeting Outcomes
          </h2>
          <div className="space-y-3">
            {meeting.outcomes.map((o) => {
              const meta = outcomeMeta[o.type];
              const u = meeting.transcript.find((x) => x.id === o.evidenceUtteranceId);
              return (
                <div
                  key={o.id}
                  className="rounded-xl border border-[var(--border)] bg-black/20 p-3"
                >
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${meta.className}`}
                  >
                    {meta.label}
                  </span>
                  <h3 className="mt-2 text-sm font-semibold">{o.title}</h3>
                  <p className="mt-1 text-sm text-white/75">{o.description}</p>
                  {o.type === "decision_change" && (
                    <p className="mt-2 text-sm">
                      <span className="text-[var(--text-muted)] line-through">
                        {o.previousValue}
                      </span>
                      <span className="mx-2">→</span>
                      <span className="font-medium">{o.newValue}</span>
                    </p>
                  )}
                  {u && (
                    <Link
                      href={`/meetings/${meeting.id}?u=${u.id}`}
                      className="mt-3 inline-flex text-xs text-[var(--accent)]"
                    >
                      ▶ Evidence · {formatTimestamp(u.startTime)}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Key Takeaways
          </h2>
          <ul className="space-y-2 text-sm text-white/80">
            {meeting.summary.takeaways?.map((t) => (
              <li key={t.id}>
                {t.label && <strong className="text-white">{t.label}: </strong>}
                {t.text}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Transcript excerpt
          </h2>
          <div className="space-y-3">
            {meeting.transcript.slice(0, 6).map((u) => {
              const speaker = getParticipant(u.speakerId);
              return (
                <div key={u.id} className="text-sm">
                  <div className="text-xs text-[var(--text-muted)]">
                    {speaker?.name} · {formatTimestamp(u.startTime)}
                  </div>
                  <p className="mt-0.5 text-white/80">{u.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-8">
          <audio controls src={meeting.audioSrc} className="w-full" preload="metadata" />
        </div>
      </article>
    </div>
  );
}
