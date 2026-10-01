"use client";

import { useState } from "react";
import { getParticipant } from "@/data/meetings";
import { usePlayback } from "@/lib/playback-context";
import { formatTimestamp } from "@/data/meetings";

export function ActionItemsPanel() {
  const { meeting, jumpToEvidence } = usePlayback();
  const [items, setItems] = useState(meeting.actionItems);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-2 py-10">
        <h2 className="text-base font-semibold">Action Items</h2>
        <p className="text-sm text-[var(--text-muted)]">No action items detected.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-base font-semibold">Action Items</h2>
      <p className="mb-4 text-sm text-[var(--text-muted)]">
        Derived from the same source as Meeting Outcomes — so commitments stay consistent.
      </p>
      <ul className="space-y-2">
        {items.map((item) => {
          const owner = getParticipant(item.ownerId);
          return (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-black/20 px-3 py-3"
            >
              <input
                type="checkbox"
                checked={item.status === "done"}
                onChange={() =>
                  setItems((prev) =>
                    prev.map((x) =>
                      x.id === item.id
                        ? { ...x, status: x.status === "done" ? "open" : "done" }
                        : x,
                    ),
                  )
                }
                className="mt-1 accent-[var(--accent)]"
                aria-label={`Mark ${item.text}`}
              />
              <div className="min-w-0 flex-1">
                <div
                  className={`text-sm font-medium ${
                    item.status === "done" ? "text-[var(--text-muted)] line-through" : ""
                  }`}
                >
                  {item.text}
                </div>
                <div className="mt-1 text-xs text-[var(--text-muted)]">
                  {owner?.name} · {item.dueLabel}
                </div>
              </div>
              <button
                type="button"
                onClick={() => jumpToEvidence(item.evidenceUtteranceId)}
                className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--accent)] hover:bg-[var(--accent-soft)]"
              >
                ▶ {formatTimestamp(
                  meeting.transcript.find((u) => u.id === item.evidenceUtteranceId)
                    ?.startTime ?? 0,
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
