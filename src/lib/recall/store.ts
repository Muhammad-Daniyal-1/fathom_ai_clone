import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import type { Meeting, Participant } from "@/data/types";
import type { CanonicalAnalysis, ParsedUtterance } from "@/lib/ai/schemas";

export type BotLaunchStatus =
  | "pending_create"
  | "scheduled"
  | "joining"
  | "in_call"
  | "recording"
  | "processing"
  | "transcribing"
  | "ready"
  | "failed"
  | "fatal";

export type BotIntent = {
  id: string;
  meetingUrl: string;
  title: string;
  botId: string | null;
  botName: string;
  status: BotLaunchStatus;
  lastEvent: string | null;
  lastCode: string | null;
  recordingId: string | null;
  transcriptId: string | null;
  meetingId: string | null;
  error: string | null;
  source: "meeting_url" | "calendar";
  calendarEventId: string | null;
  createdAt: string;
  updatedAt: string;
  createdByEmail: string | null;
};

export type CapturedMeeting = {
  id: string;
  botId: string;
  recordingId: string;
  transcriptId: string;
  title: string;
  meetingUrl: string;
  createdAt: string;
  /** Session user who launched / claimed the bot. */
  createdByEmail: string | null;
  meeting: Meeting;
  participants: Participant[];
  utterances: ParsedUtterance[];
  analysis: CanonicalAnalysis | null;
};

export type CalendarConnection = {
  calendarId: string;
  platform: "google_calendar" | "microsoft_outlook";
  platformEmail: string | null;
  status: string;
  connectedAt: string;
  updatedAt: string;
};

/** Opt-in rule: only events explicitly marked by the user are recorded. */
export type CalendarRecordingPreference = {
  calendarEventId: string;
  calendarId: string;
  record: boolean;
  meetingUrl: string | null;
  title: string | null;
  startTime: string | null;
  updatedAt: string;
};

export type ProcessedWebhook = {
  eventId: string;
  eventType: string;
  processedAt: string;
};

type StoreShape = {
  intents: BotIntent[];
  captured: CapturedMeeting[];
  calendars: CalendarConnection[];
  preferences: CalendarRecordingPreference[];
  processedWebhooks: ProcessedWebhook[];
};

const DEFAULT_STORE: StoreShape = {
  intents: [],
  captured: [],
  calendars: [],
  preferences: [],
  processedWebhooks: [],
};

function storeDir(): string {
  if (process.env.RECALL_DATA_DIR?.trim()) {
    return process.env.RECALL_DATA_DIR.trim();
  }
  // Vercel serverless filesystem is read-only except /tmp (ephemeral per instance).
  if (process.env.VERCEL) {
    return path.join("/tmp", "brief-recall");
  }
  return path.join(process.cwd(), "data", "recall");
}

function storePath(): string {
  return path.join(storeDir(), "store.json");
}

async function ensureDir(): Promise<void> {
  await mkdir(storeDir(), { recursive: true });
}

export async function readStore(): Promise<StoreShape> {
  await ensureDir();
  try {
    const raw = await readFile(storePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreShape>;
    return {
      intents: Array.isArray(parsed.intents) ? parsed.intents : [],
      captured: Array.isArray(parsed.captured) ? parsed.captured : [],
      calendars: Array.isArray(parsed.calendars) ? parsed.calendars : [],
      preferences: Array.isArray(parsed.preferences) ? parsed.preferences : [],
      processedWebhooks: Array.isArray(parsed.processedWebhooks)
        ? parsed.processedWebhooks
        : [],
    };
  } catch {
    return structuredClone(DEFAULT_STORE);
  }
}

async function writeStore(store: StoreShape): Promise<void> {
  await ensureDir();
  const tmp = `${storePath()}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  await rename(tmp, storePath());
}

export async function updateStore(
  mutator: (store: StoreShape) => void | Promise<void>,
): Promise<StoreShape> {
  const store = await readStore();
  await mutator(store);
  // Cap processed webhook log
  if (store.processedWebhooks.length > 500) {
    store.processedWebhooks = store.processedWebhooks.slice(-500);
  }
  await writeStore(store);
  return store;
}

export function newIntentId(): string {
  return `intent-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function createPendingIntent(input: {
  meetingUrl: string;
  title: string;
  botName: string;
  source: "meeting_url" | "calendar";
  calendarEventId?: string | null;
  createdByEmail?: string | null;
}): Promise<BotIntent> {
  const now = new Date().toISOString();
  const intent: BotIntent = {
    id: newIntentId(),
    meetingUrl: input.meetingUrl,
    title: input.title,
    botId: null,
    botName: input.botName,
    status: "pending_create",
    lastEvent: null,
    lastCode: null,
    recordingId: null,
    transcriptId: null,
    meetingId: null,
    error: null,
    source: input.source,
    calendarEventId: input.calendarEventId ?? null,
    createdAt: now,
    updatedAt: now,
    createdByEmail: input.createdByEmail ?? null,
  };
  await updateStore((store) => {
    store.intents.unshift(intent);
  });
  return intent;
}

export async function attachBotId(
  intentId: string,
  botId: string,
): Promise<BotIntent | null> {
  let updated: BotIntent | null = null;
  await updateStore((store) => {
    const intent = store.intents.find((i) => i.id === intentId);
    if (!intent) return;
    intent.botId = botId;
    intent.status = "scheduled";
    intent.updatedAt = new Date().toISOString();
    intent.error = null;
    updated = { ...intent };
  });
  return updated;
}

export async function markIntentFailed(
  intentId: string,
  error: string,
): Promise<void> {
  await updateStore((store) => {
    const intent = store.intents.find((i) => i.id === intentId);
    if (!intent) return;
    intent.status = "failed";
    intent.error = error;
    intent.updatedAt = new Date().toISOString();
  });
}

export async function findIntentByBotId(
  botId: string,
): Promise<BotIntent | null> {
  const store = await readStore();
  return store.intents.find((i) => i.botId === botId) ?? null;
}

export async function findIntentById(
  intentId: string,
): Promise<BotIntent | null> {
  const store = await readStore();
  return store.intents.find((i) => i.id === intentId) ?? null;
}

export async function listIntents(): Promise<BotIntent[]> {
  const store = await readStore();
  return store.intents;
}

export async function listCapturedMeetings(): Promise<CapturedMeeting[]> {
  const store = await readStore();
  return store.captured;
}

export async function getCapturedMeeting(
  id: string,
): Promise<CapturedMeeting | null> {
  const store = await readStore();
  return store.captured.find((m) => m.id === id) ?? null;
}

export async function findCapturedByBotId(
  botId: string,
): Promise<CapturedMeeting | null> {
  const store = await readStore();
  return store.captured.find((m) => m.botId === botId) ?? null;
}

export async function listIntentsForEmail(
  email: string | null | undefined,
): Promise<BotIntent[]> {
  const store = await readStore();
  if (!email) return store.intents;
  return store.intents.filter(
    (i) => !i.createdByEmail || i.createdByEmail === email,
  );
}

export async function listCapturedMeetingsForEmail(
  email: string | null | undefined,
): Promise<CapturedMeeting[]> {
  const store = await readStore();
  if (!email) return [];
  const myBotIds = new Set(
    store.intents
      .filter((i) => i.createdByEmail === email && i.botId)
      .map((i) => i.botId as string),
  );
  return store.captured.filter(
    (m) => m.createdByEmail === email || myBotIds.has(m.botId),
  );
}

/**
 * Attach a Recall bot to the authenticated user so list endpoints stay scoped.
 * Does not steal bots already owned by a different email.
 */
export async function claimBotIntentForEmail(input: {
  botId: string;
  email: string;
  meetingUrl?: string;
  title?: string;
  botName?: string;
  recordingId?: string | null;
  transcriptId?: string | null;
  meetingId?: string | null;
  status?: BotLaunchStatus;
}): Promise<{ intent: BotIntent; claimed: boolean }> {
  let intent: BotIntent | null = null;
  let claimed = false;
  const now = new Date().toISOString();

  await updateStore((store) => {
    const existing = store.intents.find((i) => i.botId === input.botId);
    if (existing) {
      if (
        existing.createdByEmail &&
        existing.createdByEmail !== input.email
      ) {
        intent = { ...existing };
        claimed = false;
        return;
      }
      existing.createdByEmail = input.email;
      if (input.meetingUrl) existing.meetingUrl = input.meetingUrl;
      if (input.title) existing.title = input.title;
      if (input.recordingId) existing.recordingId = input.recordingId;
      if (input.transcriptId) existing.transcriptId = input.transcriptId;
      if (input.meetingId) existing.meetingId = input.meetingId;
      if (input.status) existing.status = input.status;
      existing.updatedAt = now;
      intent = { ...existing };
      claimed = true;
      return;
    }

    const created: BotIntent = {
      id: newIntentId(),
      meetingUrl: input.meetingUrl || "",
      title: input.title || "Captured meeting",
      botId: input.botId,
      botName: input.botName || "Brief Notetaker",
      status: input.status ?? "processing",
      lastEvent: null,
      lastCode: null,
      recordingId: input.recordingId ?? null,
      transcriptId: input.transcriptId ?? null,
      meetingId: input.meetingId ?? null,
      error: null,
      source: "meeting_url",
      calendarEventId: null,
      createdAt: now,
      updatedAt: now,
      createdByEmail: input.email,
    };
    store.intents.unshift(created);
    intent = created;
    claimed = true;
  });

  return { intent: intent!, claimed };
}

export function userOwnsCapturedMeeting(
  meeting: CapturedMeeting,
  email: string | null | undefined,
  intents: BotIntent[],
): boolean {
  if (!email) return false;
  if (meeting.createdByEmail === email) return true;
  const intent = intents.find((i) => i.botId === meeting.botId);
  return Boolean(intent?.createdByEmail === email);
}

export async function claimWebhookEvent(
  eventId: string,
  eventType: string,
): Promise<boolean> {
  let claimed = false;
  await updateStore((store) => {
    if (store.processedWebhooks.some((w) => w.eventId === eventId)) {
      claimed = false;
      return;
    }
    store.processedWebhooks.push({
      eventId,
      eventType,
      processedAt: new Date().toISOString(),
    });
    claimed = true;
  });
  return claimed;
}

export async function upsertCalendarConnection(
  connection: CalendarConnection,
): Promise<void> {
  await updateStore((store) => {
    const idx = store.calendars.findIndex(
      (c) => c.calendarId === connection.calendarId,
    );
    if (idx >= 0) store.calendars[idx] = connection;
    else store.calendars.push(connection);
  });
}

export async function listCalendarConnections(): Promise<CalendarConnection[]> {
  const store = await readStore();
  return store.calendars;
}

export async function setRecordingPreference(
  pref: CalendarRecordingPreference,
): Promise<void> {
  await updateStore((store) => {
    const idx = store.preferences.findIndex(
      (p) => p.calendarEventId === pref.calendarEventId,
    );
    if (idx >= 0) store.preferences[idx] = pref;
    else store.preferences.push(pref);
  });
}

export async function getRecordingPreference(
  calendarEventId: string,
): Promise<CalendarRecordingPreference | null> {
  const store = await readStore();
  return (
    store.preferences.find((p) => p.calendarEventId === calendarEventId) ??
    null
  );
}

export async function listRecordingPreferences(
  calendarId?: string,
): Promise<CalendarRecordingPreference[]> {
  const store = await readStore();
  return calendarId
    ? store.preferences.filter((p) => p.calendarId === calendarId)
    : store.preferences;
}

export function shouldRecordCalendarEvent(args: {
  preference: CalendarRecordingPreference | null | undefined;
  event: {
    is_deleted: boolean;
    meeting_url: string | null;
    end_time: string;
  };
  now?: Date;
}): boolean {
  const now = args.now ?? new Date();
  if (!args.preference?.record) return false;
  if (args.event.is_deleted) return false;
  if (!args.event.meeting_url) return false;
  if (Date.parse(args.event.end_time) <= now.getTime()) return false;
  return true;
}
