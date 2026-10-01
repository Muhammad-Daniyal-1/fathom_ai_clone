import { meetings, participants } from "@/data/meetings";

export interface SearchHit {
  meetingId: string;
  meetingTitle: string;
  utteranceId: string;
  speakerName: string;
  timestamp: number;
  snippet: string;
}

export function searchMeetings(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: SearchHit[] = [];
  for (const meeting of meetings) {
    for (const u of meeting.transcript) {
      if (!u.text.toLowerCase().includes(q)) continue;
      const speaker = participants[u.speakerId];
      hits.push({
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        utteranceId: u.id,
        speakerName: speaker?.name ?? "Speaker",
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
): SearchHit[] {
  return searchMeetings(query).filter((h) => h.meetingId === meetingId);
}
