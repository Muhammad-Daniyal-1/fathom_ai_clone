import type { ParsedUtterance } from "@/lib/ai/schemas";

type TranscriptWord = {
  text?: string;
  start_timestamp?: { relative?: number; absolute?: string };
  end_timestamp?: { relative?: number; absolute?: string };
};

type TranscriptSegment = {
  participant?: { id?: number | string; name?: string | null };
  words?: TranscriptWord[];
};

function formatTs(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

/**
 * Map Recall transcript download JSON into Brief ParsedUtterance[].
 * Tolerates the common array-of-segments shape from download schemas.
 */
export function recallTranscriptToUtterances(raw: unknown): ParsedUtterance[] {
  const segments: TranscriptSegment[] = Array.isArray(raw)
    ? (raw as TranscriptSegment[])
    : Array.isArray((raw as { segments?: unknown })?.segments)
      ? ((raw as { segments: TranscriptSegment[] }).segments)
      : [];

  const utterances: ParsedUtterance[] = [];
  let index = 0;

  for (const segment of segments) {
    const words = Array.isArray(segment.words) ? segment.words : [];
    if (words.length === 0) continue;
    const text = words
      .map((w) => (typeof w.text === "string" ? w.text : ""))
      .join("")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) continue;

    const start =
      typeof words[0]?.start_timestamp?.relative === "number"
        ? words[0].start_timestamp.relative
        : index;
    const endWord = words[words.length - 1];
    const end =
      typeof endWord?.end_timestamp?.relative === "number"
        ? endWord.end_timestamp.relative
        : start + 1;

    index += 1;
    utterances.push({
      id: `u${index}`,
      speaker:
        (segment.participant?.name && String(segment.participant.name).trim()) ||
        "Speaker",
      timestamp: formatTs(start),
      startTime: start,
      text,
    });
  }

  return utterances;
}

export function titleFromMeetingUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("zoom")) return "Zoom meeting";
    if (u.hostname.includes("meet.google")) return "Google Meet";
    if (u.hostname.includes("teams")) return "Teams meeting";
    return `${u.hostname} meeting`;
  } catch {
    return "Captured meeting";
  }
}
