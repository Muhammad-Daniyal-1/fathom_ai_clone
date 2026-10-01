import { outcomeMeta } from "@/lib/brand";

/**
 * Static product preview for the marketing landing page.
 * Uses existing design tokens and outcome labels — not interactive.
 */
export function ProductPreview() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]/90 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
      aria-hidden="true"
    >
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="ml-2 truncate text-xs text-[var(--text-muted)]">
          Atlas Dashboard Weekly Sync
        </span>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px]">
        <div className="border-b border-[var(--border)] p-4 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex flex-wrap gap-2">
            {(["Summary", "Action Items", "Transcript"] as const).map(
              (tab, i) => (
                <span
                  key={tab}
                  className={`rounded-full px-3 py-1 text-xs ${
                    i === 0
                      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "border border-[var(--border)] text-[var(--text-muted)]"
                  }`}
                >
                  {tab}
                </span>
              ),
            )}
          </div>

          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Purpose
          </p>
          <p className="mb-4 text-sm leading-relaxed text-white/85">
            Align on Atlas stack decisions, launch risks, and Friday deliveries.
          </p>

          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            Outcomes
          </p>
          <ul className="space-y-2">
            {(
              [
                {
                  type: "decision" as const,
                  title: "Use PostgreSQL",
                  meta: "Stack decision",
                },
                {
                  type: "commitment" as const,
                  title: "Finish analytics dashboard",
                  meta: "Daniyal · Friday",
                },
                {
                  type: "risk" as const,
                  title: "Payment integration delay",
                  meta: "May slip beta",
                },
                {
                  type: "decision_change" as const,
                  title: "Beta launch date",
                  meta: "Oct 15 → Oct 22",
                },
              ] as const
            ).map((item) => {
              const meta = outcomeMeta[item.type];
              return (
                <li
                  key={item.title}
                  className="rounded-xl border border-[var(--border)] bg-black/20 px-3 py-2.5"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${meta.className}`}
                    >
                      {meta.label}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      Evidence
                    </span>
                  </div>
                  <div className="text-sm font-medium">{item.title}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {item.meta}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-3 bg-[var(--bg-panel)] p-4">
          <div>
            <p className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-[var(--text-muted)]">
              ACTION ITEMS
            </p>
            <ul className="space-y-2 text-sm">
              <li className="rounded-lg border border-[var(--border)] bg-black/20 px-3 py-2">
                <div className="font-medium">Finish analytics dashboard</div>
                <div className="text-xs text-[var(--text-muted)]">
                  Daniyal · Friday
                </div>
              </li>
              <li className="rounded-lg border border-[var(--border)] bg-black/20 px-3 py-2">
                <div className="font-medium">Send API credentials</div>
                <div className="text-xs text-[var(--text-muted)]">
                  Sara · Tomorrow 5pm
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-auto rounded-xl border border-[var(--border)] bg-black/25 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-[0.12em]">
              <span>✦</span> ASK AI
            </div>
            <p className="mb-2 text-xs text-[var(--text-muted)]">
              Why did the launch date change?
            </p>
            <p className="text-sm leading-relaxed text-white/85">
              Beta moved from Oct 15 to Oct 22 to reduce payment integration
              risk.
            </p>
            <div className="mt-2 text-[10px] text-[var(--accent)]">
              2 evidence links
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
