import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { RecallClient } from "@/lib/recall/client";
import { getRecallConfig, RecallConfigError } from "@/lib/recall/config";
import {
  listCalendarConnections,
  listRecordingPreferences,
} from "@/lib/recall/store";

export const runtime = "nodejs";

/** List upcoming calendar events for connected calendars (for opt-in UI). */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    getRecallConfig();
  } catch (err) {
    const message =
      err instanceof RecallConfigError ? err.message : "Recall is not configured";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const calendarId = new URL(request.url).searchParams.get("calendarId");
  const calendars = await listCalendarConnections();
  const target = calendarId
    ? calendars.filter((c) => c.calendarId === calendarId)
    : calendars;

  if (target.length === 0) {
    return NextResponse.json({ events: [], calendars: [] });
  }

  const client = new RecallClient();
  const preferences = await listRecordingPreferences();
  const prefMap = new Map(preferences.map((p) => [p.calendarEventId, p]));
  const events = [];

  for (const cal of target) {
    try {
      const page = await client.listCalendarEvents({
        calendarId: cal.calendarId,
        isDeleted: false,
      });
      for (const event of page.results ?? []) {
        if (event.is_deleted) continue;
        const pref = prefMap.get(event.id);
        events.push({
          ...event,
          platformEmail: cal.platformEmail,
          record: Boolean(pref?.record),
        });
      }
    } catch (err) {
      console.error("calendar_events_list_failed", {
        calendarId: cal.calendarId,
        message: err instanceof Error ? err.message : "unknown",
      });
    }
  }

  events.sort(
    (a, b) => Date.parse(a.start_time) - Date.parse(b.start_time),
  );

  return NextResponse.json({ events, calendars: target });
}
