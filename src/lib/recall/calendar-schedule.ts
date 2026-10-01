import { RecallClient, type CalendarEvent } from "./client";
import {
  getRecordingPreference,
  listRecordingPreferences,
  shouldRecordCalendarEvent,
  updateStore,
} from "./store";

/**
 * Opt-in rule (product):
 * - Connecting a calendar only syncs events.
 * - A bot is scheduled only when the user explicitly sets record=true for that
 *   calendar event in Brief, the event is not deleted/past, and it has a meeting URL.
 */
export async function syncCalendarEventWindow(args: {
  calendarId: string;
  updatedAtGte?: string;
  client?: RecallClient;
}): Promise<{ scheduled: number; removed: number; skipped: number }> {
  const client = args.client ?? new RecallClient();
  const prefs = await listRecordingPreferences(args.calendarId);
  const prefByEvent = new Map(prefs.map((p) => [p.calendarEventId, p]));

  let next: string | null = null;
  let scheduled = 0;
  let removed = 0;
  let skipped = 0;
  const seen = new Set<string>();

  // First page via list helper; follow `next` URLs without rewriting query params.
  let page = await client.listCalendarEvents({
    calendarId: args.calendarId,
    updatedAtGte: args.updatedAtGte,
  });

  for (;;) {
    for (const event of page.results ?? []) {
      if (seen.has(event.id)) continue;
      seen.add(event.id);
      const result = await applyOptInForEvent({
        event,
        preference: prefByEvent.get(event.id) ?? null,
        client,
      });
      if (result === "scheduled") scheduled += 1;
      else if (result === "removed") removed += 1;
      else skipped += 1;
    }

    next = page.next;
    if (!next) break;
    page = await client.followCalendarEventsNext(next);
  }

  await updateStore((store) => {
    const row = store.calendars.find((c) => c.calendarId === args.calendarId);
    if (row) row.updatedAt = new Date().toISOString();
  });

  return { scheduled, removed, skipped };
}

export async function applyOptInForEvent(args: {
  event: CalendarEvent;
  preference?: Awaited<ReturnType<typeof getRecordingPreference>>;
  client?: RecallClient;
}): Promise<"scheduled" | "removed" | "skipped"> {
  const client = args.client ?? new RecallClient();
  const preference =
    args.preference === undefined
      ? await getRecordingPreference(args.event.id)
      : args.preference;

  const want = shouldRecordCalendarEvent({
    preference,
    event: args.event,
  });
  const hasBot = Array.isArray(args.event.bots) && args.event.bots.length > 0;

  if (!want) {
    if (hasBot) {
      await client.removeBotFromCalendarEvent(args.event.id);
      return "removed";
    }
    return "skipped";
  }

  const meetingUrl = args.event.meeting_url!;
  const deduplication_key = `${args.event.start_time}-${meetingUrl}`;
  await client.scheduleBotForCalendarEvent(args.event.id, {
    deduplication_key,
    bot_config: {
      bot_name: client.botName,
      meeting_url: meetingUrl,
      metadata: {
        source: "brief-calendar",
        calendar_event_id: args.event.id,
      },
      recording_config: {},
    },
  });
  return "scheduled";
}
