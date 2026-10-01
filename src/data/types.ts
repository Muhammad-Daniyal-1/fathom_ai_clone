export type OutcomeType =
  | "decision"
  | "commitment"
  | "risk"
  | "decision_change"
  | "open_question";

export type OutcomeStatus = "open" | "done";

export interface Participant {
  id: string;
  name: string;
  initials: string;
  role?: string;
}

export interface TranscriptUtterance {
  id: string;
  speakerId: string;
  startTime: number;
  endTime: number;
  text: string;
}

export interface SummarySection {
  title: string;
  body?: string;
  bullets?: Array<{
    id: string;
    label?: string;
    text: string;
    evidenceUtteranceId?: string;
  }>;
  topics?: Array<{
    id: string;
    title: string;
    bullets: Array<{ text: string; evidenceUtteranceId?: string }>;
  }>;
}

export interface MeetingOutcome {
  id: string;
  type: OutcomeType;
  title: string;
  description: string;
  ownerId?: string;
  dueLabel?: string;
  status?: OutcomeStatus;
  previousValue?: string;
  newValue?: string;
  /** Primary evidence (seeded + generated). */
  evidenceUtteranceId: string;
  /** All validated evidence IDs (generated meetings; optional for seeded). */
  evidenceUtteranceIds?: string[];
  /** Model-reported evidence strength 0–1 (generated only; not objective truth). */
  confidence?: number;
}

export interface ActionItem {
  id: string;
  text: string;
  /** Undefined when Groq did not establish an owner — never invent one. */
  ownerId?: string;
  /** Undefined when no deadline was stated. */
  dueLabel?: string;
  status: OutcomeStatus;
  outcomeId: string;
  evidenceUtteranceId: string;
}

export interface AskSuggestion {
  id: string;
  prompt: string;
  answer: string;
  evidenceUtteranceIds?: string[];
}

export type MeetingSource = "recall" | "transcript" | "demo";

export interface Meeting {
  id: string;
  title: string;
  dateISO: string;
  dateLabel: string;
  groupLabel: string;
  durationSec: number;
  description: string;
  audioSrc: string;
  waveformHue: number;
  participantIds: string[];
  /** How the meeting entered Brief. Optional for seeded demos. */
  source?: MeetingSource;
  transcript: TranscriptUtterance[];
  summary: {
    templateName: string;
    purpose: string;
    takeaways: SummarySection["bullets"];
    topics: NonNullable<SummarySection["topics"]>;
    nextSteps: SummarySection["bullets"];
  };
  outcomes: MeetingOutcome[];
  actionItems: ActionItem[];
  askSuggestions: AskSuggestion[];
}
