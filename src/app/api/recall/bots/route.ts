import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { RecallApiError, RecallClient } from "@/lib/recall/client";
import { RecallConfigError, getRecallConfig } from "@/lib/recall/config";
import {
  attachBotId,
  createPendingIntent,
  listIntentsForEmail,
  markIntentFailed,
} from "@/lib/recall/store";
import { titleFromMeetingUrl } from "@/lib/recall/transcript";

export const runtime = "nodejs";

function isLikelyMeetingUrl(value: string): boolean {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const host = u.hostname.toLowerCase();
    return (
      host.includes("zoom.us") ||
      host.includes("zoom.com") ||
      host.includes("meet.google.com") ||
      host.includes("teams.microsoft.com") ||
      host.includes("teams.live.com") ||
      host.includes("webex.com")
    );
  } catch {
    return false;
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const intents = await listIntentsForEmail(session.user.email);
  return NextResponse.json({ intents });
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

  let body: { meetingUrl?: string; title?: string; botName?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const meetingUrl =
    typeof body.meetingUrl === "string" ? body.meetingUrl.trim() : "";
  if (!meetingUrl || !isLikelyMeetingUrl(meetingUrl)) {
    return NextResponse.json(
      {
        error:
          "Provide a supported Zoom, Google Meet, Teams, or Webex meeting URL.",
      },
      { status: 400 },
    );
  }

  const client = new RecallClient();
  const title =
    typeof body.title === "string" && body.title.trim()
      ? body.title.trim()
      : titleFromMeetingUrl(meetingUrl);
  const botName =
    typeof body.botName === "string" && body.botName.trim()
      ? body.botName.trim()
      : client.botName;

  // Persist local scheduling intent before calling Create Bot.
  const intent = await createPendingIntent({
    meetingUrl,
    title,
    botName,
    source: "meeting_url",
    createdByEmail: session.user.email ?? null,
  });

  try {
    const bot = await client.createBot({
      meetingUrl,
      botName,
      metadata: {
        brief_intent_id: intent.id,
      },
    });
    const updated = await attachBotId(intent.id, bot.id);
    return NextResponse.json(
      {
        intent: updated,
        bot: { id: bot.id, bot_name: bot.bot_name, join_at: bot.join_at },
      },
      { status: 201 },
    );
  } catch (err) {
    const message =
      err instanceof RecallApiError
        ? `Recall create bot failed (${err.status})`
        : err instanceof Error
          ? err.message
          : "Failed to create bot";
    await markIntentFailed(intent.id, message);
    const status = err instanceof RecallApiError ? err.status : 500;
    return NextResponse.json(
      { error: message, intentId: intent.id },
      { status: status >= 400 && status < 600 ? status : 500 },
    );
  }
}
