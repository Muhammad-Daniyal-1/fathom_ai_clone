export const OUTCOME_TYPES = [
  "decision",
  "commitment",
  "risk",
  "decision_change",
  "open_question",
] as const;

export type AiOutcomeType = (typeof OUTCOME_TYPES)[number];

export interface ParsedUtterance {
  id: string;
  speaker: string;
  timestamp: string;
  startTime: number;
  text: string;
}

export interface AiKeyTakeaway {
  text: string;
  evidenceIds: string[];
}

export interface AiTopic {
  title: string;
  summary: string;
  evidenceIds: string[];
}

export interface AiNextStep {
  text: string;
  owner: string | null;
  due: string | null;
  evidenceIds: string[];
}

export interface AiSummary {
  purpose: string;
  keyTakeaways: AiKeyTakeaway[];
  topics: AiTopic[];
  nextSteps: AiNextStep[];
}

export interface AiOutcome {
  type: AiOutcomeType;
  title: string;
  description: string;
  owner: string | null;
  due: string | null;
  status: "open" | "done" | null;
  confidence: number;
  evidenceIds: string[];
  previousValue?: string | null;
  newValue?: string | null;
}

export interface CanonicalAnalysis {
  summary: AiSummary;
  outcomes: AiOutcome[];
}

export interface AnalyzeMeetingResult {
  utterances: ParsedUtterance[];
  analysis: CanonicalAnalysis;
}
