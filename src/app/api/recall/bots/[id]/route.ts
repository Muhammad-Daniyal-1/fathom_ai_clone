import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { RecallClient } from "@/lib/recall/client";
import {
  ensureCapturedMeetingFromBot,
} from "@/lib/recall/process";
import {
  findIntentByBotId,
  findIntentById,
  getCapturedMeeting,
} from "@/lib/recall/store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  let intent =
    (await findIntentById(id)) || (await findIntentByBotId(id));

  if (
    intent?.createdByEmail &&
    session.user.email &&
    intent.createdByEmail !== session.user.email
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const botId = intent?.botId || (id.match(/^[0-9a-f-]{20,}$/i) ? id : null);

  let remote = null;
  let sync: { meetingId: string | null; status: string } | null = null;

  if (botId) {
    try {
      remote = await new RecallClient().getBot(botId);
    } catch {
      remote = null;
    }

    try {
      sync = await ensureCapturedMeetingFromBot(botId);
      // Refresh intent after sync side effects
      intent = (await findIntentByBotId(botId)) || intent;
    } catch (err) {
      console.error("recall_bot_sync_error", {
        botId,
        message: err instanceof Error ? err.message : "unknown",
      });
    }
  }

  if (!intent && !remote) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const meetingId = sync?.meetingId || intent?.meetingId || null;
  const captured = meetingId ? await getCapturedMeeting(meetingId) : null;

  return NextResponse.json({
    intent,
    bot: remote,
    status: sync?.status || intent?.status || null,
    meetingId,
    meeting: captured
      ? {
          id: captured.id,
          title: captured.title,
          meeting: captured.meeting,
          participants: captured.participants,
          utterances: captured.utterances,
          analysis: captured.analysis,
          createdAt: captured.createdAt,
        }
      : null,
  });
}
