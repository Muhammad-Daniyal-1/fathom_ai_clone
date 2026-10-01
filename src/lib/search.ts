import { meetings, getParticipant } from "@/data/meetings";
import type { Meeting } from "@/data/types";

export interface SearchHit {
  meetingId: string;
  meetingTitle: string;
  utteranceId: string;
  speakerName: string;
  timestamp: number;
  snippet: string;
}

export function searchMeetings(
  query: string,
  extraMeetings: Meeting[] = [],
): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: SearchHit[] = [];
  const corpus = [...extraMeetings, ...meetings];
  const seen = new Set<string>();

  for (const meeting of corpus) {
    if (seen.has(meeting.id)) continue;
    seen.add(meeting.id);

    if (meeting.title.toLowerCase().includes(q)) {
      const first = meeting.transcript[0];
      if (first) {
        hits.push({
          meetingId: meeting.id,
          meetingTitle: meeting.title,
          utteranceId: first.id,
          speakerName: getParticipant(first.speakerId)?.name ?? "Speaker",
          timestamp: first.startTime,
          snippet: meeting.description || meeting.title,
        });
      }
    }

    for (const o of meeting.outcomes) {
      if (
        o.title.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q)
      ) {
        hits.push({
          meetingId: meeting.id,
          meetingTitle: meeting.title,
          utteranceId: o.evidenceUtteranceId,
          speakerName: "Outcome",
          timestamp:
            meeting.transcript.find((u) => u.id === o.evidenceUtteranceId)
              ?.startTime ?? 0,
          snippet: `[${o.type}] ${o.title}`,
        });
      }
    }

    for (const u of meeting.transcript) {
      if (!u.text.toLowerCase().includes(q)) continue;
      hits.push({
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        utteranceId: u.id,
        speakerName: getParticipant(u.speakerId)?.name ?? "Speaker",
        timestamp: u.startTime,
        snippet: u.text,
      });
    }
  }

  return hits.slice(0, 24);
}

export function searchTranscript(
  meetingId: string,
  query: string,
  extraMeetings: Meeting[] = [],
): SearchHit[] {
  return searchMeetings(query, extraMeetings).filter(
    (h) => h.meetingId === meetingId,
  );
}
