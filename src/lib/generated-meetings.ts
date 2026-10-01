import type { Meeting, Participant } from "@/data/types";
import type { CanonicalAnalysis, ParsedUtterance } from "@/lib/ai/schemas";

const STORAGE_KEY = "brief.generatedMeetings.v1";

export interface StoredGeneratedMeeting {
  id: string;
  title: string;
  createdAt: string;
  meeting: Meeting;
  participants: Participant[];
  utterances: ParsedUtterance[];
  analysis: CanonicalAnalysis;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadGeneratedMeetings(): StoredGeneratedMeeting[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredGeneratedMeeting[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGeneratedMeeting(
  entry: StoredGeneratedMeeting,
): StoredGeneratedMeeting[] {
  const existing = loadGeneratedMeetings().filter((m) => m.id !== entry.id);
  const next = [entry, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function getGeneratedMeeting(
  id: string,
): StoredGeneratedMeeting | undefined {
  return loadGeneratedMeetings().find((m) => m.id === id);
}

export function getGeneratedMeetingAsMeeting(id: string): Meeting | undefined {
  return getGeneratedMeeting(id)?.meeting;
}
