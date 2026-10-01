import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { RecallClient } from "@/lib/recall/client";
import {
  getRecallConfig,
  recallCalendarCallbackPath,
  RecallConfigError,
} from "@/lib/recall/config";
import { applyOptInForEvent } from "@/lib/recall/calendar-schedule";
import {
  listCalendarConnections,
  listRecordingPreferences,
  setRecordingPreference,
  upsertCalendarConnection,
} from "@/lib/recall/store";

export const runtime = "nodejs";

/**
 * Calendar connection status + opt-in preferences.
 * Connecting a calendar authorizes event sync only — recording stays opt-in.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let publicCallback: string | null = null;
  try {
    const cfg = getRecallConfig();
    publicCallback = `${cfg.publicApiBaseUrl}${recallCalendarCallbackPath()}`;
  } catch {
    publicCallback = null;
  }

  const calendars = await listCalendarConnections();
  const preferences = await listRecordingPreferences();

  return NextResponse.json({
    calendars,
    preferences,
    optInRule:
      "Bots are scheduled only for calendar events you explicitly mark Record in Brief. Connecting a calendar does not record every meeting.",
    callbackUrl: publicCallback,
  });
}

export async function POST(request: Request) {
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

  let body: {
    action?: string;
    calendarId?: string;
    platform?: "google_calendar" | "microsoft_outlook";
    platformEmail?: string | null;
    status?: string;
    calendarEventId?: string;
    record?: boolean;
    meetingUrl?: string | null;
    title?: string | null;
    startTime?: string | null;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.action === "register_calendar") {
    if (!body.calendarId || !body.platform) {
      return NextResponse.json(
        { error: "calendarId and platform are required" },
        { status: 400 },
      );
    }
    const now = new Date().toISOString();
    await upsertCalendarConnection({
      calendarId: body.calendarId,
      platform: body.platform,
      platformEmail: body.platformEmail ?? null,
      status: body.status ?? "connected",
      connectedAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "set_preference") {
    if (!body.calendarEventId || !body.calendarId || typeof body.record !== "boolean") {
      return NextResponse.json(
        { error: "calendarEventId, calendarId, and record are required" },
        { status: 400 },
      );
    }

    const pref = {
      calendarEventId: body.calendarEventId,
      calendarId: body.calendarId,
      record: body.record,
      meetingUrl: body.meetingUrl ?? null,
      title: body.title ?? null,
      startTime: body.startTime ?? null,
      updatedAt: new Date().toISOString(),
    };
    await setRecordingPreference(pref);

    // Apply immediately when we have enough event fields.
    if (body.meetingUrl || body.record === false) {
      try {
        const client = new RecallClient();
        // Prefer live event when possible
        const page = await client.listCalendarEvents({
          calendarId: body.calendarId,
          isDeleted: false,
        });
        const event = page.results.find((e) => e.id === body.calendarEventId);
        if (event) {
          const result = await applyOptInForEvent({ event, preference: pref, client });
          return NextResponse.json({ ok: true, preference: pref, applied: result });
        }
      } catch {
        // Preference is still saved; webhook sync will apply later.
      }
    }

    return NextResponse.json({ ok: true, preference: pref });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
