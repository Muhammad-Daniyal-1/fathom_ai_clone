import type {
  ActionItem,
  Meeting,
  MeetingOutcome,
  Participant,
  TranscriptUtterance,
} from "@/data/types";
import type { CanonicalAnalysis, ParsedUtterance } from "./schemas";

function slugify(name: string): string {
  const s = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "speaker";
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function buildParticipantsFromUtterances(
  utterances: ParsedUtterance[],
): Participant[] {
  const seen = new Map<string, Participant>();
  for (const u of utterances) {
    const id = slugify(u.speaker);
    if (seen.has(id)) continue;
    seen.set(id, {
      id,
      name: u.speaker,
      initials: initials(u.speaker),
    });
  }
  return Array.from(seen.values());
}

function toTranscript(
  utterances: ParsedUtterance[],
  participants: Participant[],
): TranscriptUtterance[] {
  const byName = new Map(
    participants.map((p) => [p.name.toLowerCase(), p.id]),
  );
  return utterances.map((u, i) => {
    const next = utterances[i + 1];
    const endTime = next
      ? Math.max(u.startTime + 0.5, next.startTime)
      : u.startTime + Math.max(3, Math.ceil(u.text.split(/\s+/).length * 0.4));
    return {
      id: u.id,
      speakerId: byName.get(u.speaker.toLowerCase()) ?? slugify(u.speaker),
      startTime: u.startTime,
      endTime,
      text: u.text,
    };
  });
}

function resolveOwnerId(
  owner: string | null | undefined,
  participants: Participant[],
): string | undefined {
  if (!owner) return undefined;
  const lower = owner.toLowerCase();
  const hit = participants.find(
    (p) =>
      p.name.toLowerCase() === lower ||
      p.name.toLowerCase().startsWith(lower) ||
      lower.startsWith(p.name.toLowerCase()) ||
      p.id === slugify(owner),
  );
  return hit?.id;
}

function firstEvidence(ids: string[]): string {
  return ids[0];
}

export function analysisToMeeting(input: {
  title: string;
  utterances: ParsedUtterance[];
  analysis: CanonicalAnalysis;
  id?: string;
}): { meeting: Meeting; participants: Participant[] } {
  const id =
    input.id ??
    `gen-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const participants = buildParticipantsFromUtterances(input.utterances);
  const transcript = toTranscript(input.utterances, participants);
  const durationSec = transcript.length
    ? Math.ceil(transcript[transcript.length - 1].endTime)
    : 0;

  const outcomes: MeetingOutcome[] = input.analysis.outcomes.map((o, i) => ({
    id: `${id}-o${i + 1}`,
    type: o.type,
    title: o.title,
    description: o.description,
    ownerId: resolveOwnerId(o.owner, participants),
    dueLabel: o.due ?? undefined,
    status: o.status ?? (o.type === "commitment" ? "open" : undefined),
    previousValue: o.previousValue ?? undefined,
    newValue: o.newValue ?? undefined,
    evidenceUtteranceId: firstEvidence(o.evidenceIds),
  }));

  const actionItems: ActionItem[] = outcomes
    .filter((o) => o.type === "commitment")
    .map((o, i) => ({
      id: `${id}-a${i + 1}`,
      text: o.title,
      ownerId: o.ownerId ?? participants[0]?.id ?? "unknown",
      dueLabel: o.dueLabel ?? "TBD",
      status: o.status ?? "open",
      outcomeId: o.id,
      evidenceUtteranceId: o.evidenceUtteranceId,
    }));

  // Also surface nextSteps that aren't already commitments
  const commitmentTitles = new Set(
    actionItems.map((a) => a.text.toLowerCase()),
  );
  for (const step of input.analysis.summary.nextSteps) {
    if (!step.evidenceIds.length) continue;
    if (commitmentTitles.has(step.text.toLowerCase())) continue;
    const ownerId =
      resolveOwnerId(step.owner, participants) ??
      participants[0]?.id ??
      "unknown";
    actionItems.push({
      id: `${id}-a${actionItems.length + 1}`,
      text: step.text,
      ownerId,
      dueLabel: step.due ?? "TBD",
      status: "open",
      outcomeId: outcomes.find((o) => o.type === "commitment")?.id ?? `${id}-o0`,
      evidenceUtteranceId: firstEvidence(step.evidenceIds),
    });
  }

  const now = new Date();
  const meeting: Meeting = {
    id,
    title: input.title,
    dateISO: now.toISOString().slice(0, 10),
    dateLabel: "Just now",
    groupLabel: "Generated",
    durationSec,
    description:
      input.analysis.summary.purpose ||
      "AI-generated meeting intelligence from transcript analysis.",
    audioSrc: "",
    waveformHue: 200 + (id.charCodeAt(4) % 80),
    participantIds: participants.map((p) => p.id),
    transcript,
    summary: {
      templateName: "Enhanced Summary",
      purpose: input.analysis.summary.purpose,
      takeaways: input.analysis.summary.keyTakeaways.map((t, i) => ({
        id: `${id}-t${i + 1}`,
        text: t.text,
        evidenceUtteranceId: t.evidenceIds[0],
      })),
      topics: input.analysis.summary.topics.map((t, i) => ({
        id: `${id}-topic${i + 1}`,
        title: t.title,
        bullets: [
          {
            text: t.summary,
            evidenceUtteranceId: t.evidenceIds[0],
          },
        ],
      })),
      nextSteps: input.analysis.summary.nextSteps.map((s, i) => ({
        id: `${id}-ns${i + 1}`,
        text: s.text,
        label: s.owner ?? undefined,
        evidenceUtteranceId: s.evidenceIds[0],
      })),
    },
    outcomes,
    actionItems,
    askSuggestions: [
      {
        id: `${id}-ask1`,
        prompt: "What was decided?",
        answer: "",
        evidenceUtteranceIds: [],
      },
      {
        id: `${id}-ask2`,
        prompt: "What commitments were made?",
        answer: "",
        evidenceUtteranceIds: [],
      },
      {
        id: `${id}-ask3`,
        prompt: "What remains unresolved?",
        answer: "",
        evidenceUtteranceIds: [],
      },
    ],
  };

  return { meeting, participants };
}
