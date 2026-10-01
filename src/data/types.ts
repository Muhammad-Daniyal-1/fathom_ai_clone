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
  evidenceUtteranceId: string;
}

export interface ActionItem {
  id: string;
  text: string;
  ownerId: string;
  dueLabel: string;
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
