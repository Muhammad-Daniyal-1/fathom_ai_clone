import { analyzeMeeting } from "@/lib/ai/groq";
import type { CanonicalAnalysis } from "@/lib/ai/schemas";
import { analysisToMeeting } from "@/lib/ai/to-meeting";
import { downloadJson, RecallClient } from "./client";
import {
  findCapturedByBotId,
  findIntentByBotId,
  updateStore,
  type BotLaunchStatus,
  type CapturedMeeting,
} from "./store";
import {
  recallTranscriptToUtterances,
  titleFromMeetingUrl,
} from "./transcript";

type WebhookPayload = {
  event?: string;
  data?: {
    data?: { code?: string; sub_code?: string | null; updated_at?: string };
    bot?: { id?: string; metadata?: Record<string, unknown> };
    recording?: { id?: string; metadata?: Record<string, unknown> };
    transcript?: { id?: string; metadata?: Record<string, unknown> };
    calendar_id?: string;
    last_updated_ts?: string;
  };
};

function mapBotStatus(event: string, code?: string): BotLaunchStatus | null {
  const key = event || (code ? `bot.${code}` : "");
  switch (key) {
    case "bot.joining_call":
    case "bot.in_waiting_room":
      return "joining";
    case "bot.in_call_not_recording":
    case "bot.recording_permission_allowed":
      return "in_call";
    case "bot.in_call_recording":
      return "recording";
    case "bot.call_ended":
    case "bot.done":
      return "processing";
    case "bot.fatal":
      return "fatal";
    case "bot.recording_permission_denied":
      return "failed";
    default:
      return null;
  }
}

async function patchIntentByBotId(
  botId: string,
  patch: Partial<{
    status: BotLaunchStatus;
    lastEvent: string;
    lastCode: string | null;
    recordingId: string | null;
    transcriptId: string | null;
    meetingId: string | null;
    error: string | null;
  }>,
): Promise<void> {
  await updateStore((store) => {
    const intent = store.intents.find((i) => i.botId === botId);
    if (!intent) return;
    Object.assign(intent, patch, { updatedAt: new Date().toISOString() });
  });
}

/**
 * Durable webhook side effects. Caller must verify signature and claim
 * idempotency before invoking.
 */
export async function processRecallWebhookEvent(
  payload: WebhookPayload,
  client = new RecallClient(),
): Promise<{ handled: boolean; detail: string }> {
  const event = payload.event ?? "";
  const botId = payload.data?.bot?.id;
  const recordingId = payload.data?.recording?.id;
  const transcriptId = payload.data?.transcript?.id;
  const code = payload.data?.data?.code;

  if (event.startsWith("bot.") && botId) {
    const status = mapBotStatus(event, code);
    await patchIntentByBotId(botId, {
      ...(status ? { status } : {}),
      lastEvent: event,
      lastCode: code ?? payload.data?.data?.sub_code ?? null,
      error:
        event === "bot.fatal" || event === "bot.recording_permission_denied"
          ? payload.data?.data?.sub_code || event
          : null,
    });
    return { handled: true, detail: `bot_status:${event}` };
  }

  if (event === "recording.done" && recordingId) {
    if (botId) {
      await patchIntentByBotId(botId, {
        status: "transcribing",
        lastEvent: event,
        recordingId,
      });
    }
    try {
      const created = await client.createAsyncTranscript(recordingId);
      if (botId && created.id) {
        await patchIntentByBotId(botId, {
          transcriptId: created.id,
          status: "transcribing",
          lastEvent: event,
          recordingId,
        });
      }
      return { handled: true, detail: `transcript_started:${created.id}` };
    } catch (err) {
      const message = err instanceof Error ? err.message : "transcript_create_failed";
      if (botId) {
        await patchIntentByBotId(botId, {
          status: "failed",
          error: message,
          lastEvent: event,
          recordingId,
        });
      }
      throw err;
    }
  }

  if (event === "recording.failed" && botId) {
    await patchIntentByBotId(botId, {
      status: "failed",
      lastEvent: event,
      error: payload.data?.data?.sub_code || "recording.failed",
      recordingId: recordingId ?? null,
    });
    return { handled: true, detail: "recording_failed" };
  }

  if (event === "transcript.done" && (transcriptId || recordingId || botId)) {
    const resolved = await finalizeTranscript({
      client,
      botId: botId ?? null,
      recordingId: recordingId ?? null,
      transcriptId: transcriptId ?? null,
    });
    return { handled: true, detail: `meeting_ready:${resolved}` };
  }

  if (event === "transcript.failed" && botId) {
    await patchIntentByBotId(botId, {
      status: "failed",
      lastEvent: event,
      error: payload.data?.data?.sub_code || "transcript.failed",
      transcriptId: transcriptId ?? null,
    });
    return { handled: true, detail: "transcript_failed" };
  }

  if (event === "calendar.sync_events" && payload.data?.calendar_id) {
    const { syncCalendarEventWindow } = await import("./calendar-schedule");
    const result = await syncCalendarEventWindow({
      calendarId: payload.data.calendar_id,
      updatedAtGte: payload.data.last_updated_ts,
      client,
    });
    return {
      handled: true,
      detail: `calendar_sync:scheduled=${result.scheduled},removed=${result.removed},skipped=${result.skipped}`,
    };
  }

  if (event === "calendar.update" && payload.data?.calendar_id) {
    try {
      const cal = await client.getCalendar(payload.data.calendar_id);
      await updateStore((store) => {
        const row = store.calendars.find(
          (c) => c.calendarId === payload.data?.calendar_id,
        );
        if (row) {
          row.status = cal.status ?? row.status;
          row.platformEmail = cal.platform_email ?? row.platformEmail;
          row.updatedAt = new Date().toISOString();
        }
      });
    } catch {
      // calendar may have been deleted
    }
    return { handled: true, detail: "calendar_update" };
  }

  return { handled: false, detail: `ignored:${event || "unknown"}` };
}

function stableMeetingId(botId: string | null, transcriptId: string | null): string {
  if (botId) return `recall-${botId}`;
  if (transcriptId) return `recall-tr-${transcriptId}`;
  return `recall-${Date.now().toString(36)}`;
}

/**
 * Download Recall transcript → existing Groq pipeline → CapturedMeeting.
 * Idempotent per botId (stable meeting id). Safe to call from webhook or poll.
 */
export async function finalizeTranscript(args: {
  client: RecallClient;
  botId: string | null;
  recordingId: string | null;
  transcriptId: string | null;
}): Promise<string> {
  let transcriptId = args.transcriptId;
  let recordingId = args.recordingId;
  const botId = args.botId;
  let downloadUrl: string | undefined;

  if (botId) {
    const existing = await findCapturedByBotId(botId);
    if (existing) {
      await patchIntentByBotId(botId, {
        status: "ready",
        meetingId: existing.id,
        recordingId: existing.recordingId,
        transcriptId: existing.transcriptId,
        lastEvent: "transcript.done",
        error: null,
      });
      return existing.id;
    }
  }

  if (transcriptId) {
    const tr = await args.client.getTranscript(transcriptId);
    downloadUrl = tr.data?.download_url;
  }

  if (!downloadUrl && recordingId) {
    const rec = await args.client.getRecording(recordingId);
    transcriptId = rec.media_shortcuts?.transcript?.id ?? transcriptId;
    downloadUrl = rec.media_shortcuts?.transcript?.data?.download_url;
  }

  if (!downloadUrl && botId) {
    const bot = await args.client.getBot(botId);
    const rec = bot.recordings?.[0];
    recordingId = rec?.id ?? recordingId;
    const shortcuts = rec?.media_shortcuts as
      | {
          transcript?: { id?: string; data?: { download_url?: string } };
        }
      | undefined;
    transcriptId = shortcuts?.transcript?.id ?? transcriptId;
    downloadUrl = shortcuts?.transcript?.data?.download_url;
  }

  if (!downloadUrl) {
    throw new Error("Transcript download URL unavailable");
  }

  const raw = await downloadJson(downloadUrl);
  const utterances = recallTranscriptToUtterances(raw);
  if (utterances.length === 0) {
    throw new Error("Transcript contained no utterances");
  }

  const intent = botId ? await findIntentByBotId(botId) : null;
  const title =
    intent?.title ||
    (intent?.meetingUrl
      ? titleFromMeetingUrl(intent.meetingUrl)
      : "Captured meeting");

  let analysis: CanonicalAnalysis;
  try {
    analysis = await analyzeMeeting(utterances);
  } catch {
    // Capture still succeeds with transcript-only meeting if Groq is down.
    analysis = {
      summary: {
        purpose: "Transcript captured by Brief Notetaker via Recall.ai.",
        keyTakeaways: utterances.slice(0, 3).map((u) => ({
          text: u.text,
          evidenceIds: [u.id],
        })),
        topics: [],
        nextSteps: [],
      },
      outcomes: [],
    };
  }

  const meetingId = stableMeetingId(botId, transcriptId);
  const { meeting, participants } = analysisToMeeting({
    id: meetingId,
    title,
    utterances,
    analysis,
  });
  meeting.groupLabel = "Captured";
  meeting.description =
    analysis.summary.purpose ||
    "Meeting captured by Brief Notetaker (Recall.ai).";

  const captured: CapturedMeeting = {
    id: meetingId,
    botId: botId || intent?.botId || "unknown",
    recordingId: recordingId || intent?.recordingId || "unknown",
    transcriptId: transcriptId || intent?.transcriptId || "unknown",
    title,
    meetingUrl: intent?.meetingUrl || "",
    createdAt: new Date().toISOString(),
    meeting,
    participants,
    utterances,
    analysis,
  };

  await updateStore((store) => {
    store.captured = [
      captured,
      ...store.captured.filter(
        (c) => c.id !== meetingId && (!botId || c.botId !== botId),
      ),
    ];
    if (botId) {
      const row = store.intents.find((i) => i.botId === botId);
      if (row) {
        row.status = "ready";
        row.meetingId = meetingId;
        row.recordingId = captured.recordingId;
        row.transcriptId = captured.transcriptId;
        row.lastEvent = "transcript.done";
        row.error = null;
        row.updatedAt = new Date().toISOString();
      }
    }
  });

  return meetingId;
}

/**
 * Poll-path recovery for Vercel: if webhook landed on another isolate,
 * fetch bot/recording/transcript from Recall and finalize here.
 */
export async function ensureCapturedMeetingFromBot(
  botId: string,
  client = new RecallClient(),
): Promise<{ meetingId: string | null; status: BotLaunchStatus | string }> {
  const existing = await findCapturedByBotId(botId);
  if (existing) {
    return { meetingId: existing.id, status: "ready" };
  }

  const intent = await findIntentByBotId(botId);
  if (intent?.meetingId) {
    return { meetingId: intent.meetingId, status: intent.status };
  }

  const bot = await client.getBot(botId);
  const codes = (bot.status_changes ?? [])
    .map((s) => s.code)
    .filter((c): c is string => Boolean(c));
  const latest = codes[codes.length - 1] ?? "";

  if (latest === "fatal") {
    await patchIntentByBotId(botId, {
      status: "fatal",
      lastCode: latest,
      lastEvent: `bot.${latest}`,
      error: latest,
    });
    return { meetingId: null, status: "fatal" };
  }

  const recording = bot.recordings?.[0];
  const shortcuts = recording?.media_shortcuts as
    | {
        transcript?: { id?: string; data?: { download_url?: string } };
      }
    | undefined;

  if (shortcuts?.transcript?.data?.download_url || shortcuts?.transcript?.id) {
    const meetingId = await finalizeTranscript({
      client,
      botId,
      recordingId: recording?.id ?? null,
      transcriptId: shortcuts.transcript?.id ?? null,
    });
    return { meetingId, status: "ready" };
  }

  if (recording?.id && (latest === "done" || latest === "call_ended")) {
    await patchIntentByBotId(botId, {
      status: "transcribing",
      recordingId: recording.id,
      lastCode: latest,
      lastEvent: `bot.${latest}`,
    });
    try {
      const created = await client.createAsyncTranscript(recording.id);
      await patchIntentByBotId(botId, {
        transcriptId: created.id,
        status: "transcribing",
      });
    } catch {
      // Transcript may already exist; try finalize next poll.
    }
    return { meetingId: null, status: "transcribing" };
  }

  const mapped =
    mapBotStatus(`bot.${latest}`, latest) ||
    (intent?.status ?? "processing");
  if (latest) {
    await patchIntentByBotId(botId, {
      status: typeof mapped === "string" && mapped !== intent?.status
        ? (mapped as BotLaunchStatus)
        : intent?.status ?? "processing",
      lastCode: latest,
      lastEvent: `bot.${latest}`,
      recordingId: recording?.id ?? intent?.recordingId ?? null,
    });
  }

  return {
    meetingId: null,
    status: (await findIntentByBotId(botId))?.status ?? mapped,
  };
}
