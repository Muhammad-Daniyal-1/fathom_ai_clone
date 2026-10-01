import type { OutcomeType } from "@/data/types";

export const outcomeMeta: Record<
  OutcomeType,
  { label: string; className: string }
> = {
  decision: {
    label: "Decision",
    className: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  },
  commitment: {
    label: "Commitment",
    className: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  },
  risk: {
    label: "Risk",
    className: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  },
  decision_change: {
    label: "Changed",
    className: "bg-violet-500/15 text-violet-300 ring-violet-500/30",
  },
  open_question: {
    label: "Open question",
    className: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
  },
};

export const productName = "Brief";
export const productTagline = "Meeting intelligence that keeps agreements honest.";
