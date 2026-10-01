import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  findIntentByBotId,
  getCapturedMeeting,
  listCapturedMeetingsForEmail,
  listIntentsForEmail,
  userOwnsCapturedMeeting,
} from "@/lib/recall/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email ?? null;
  const id = new URL(request.url).searchParams.get("id");
  if (id) {
    const meeting = await getCapturedMeeting(id);
    if (!meeting) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const intents = await listIntentsForEmail(email);
    const intent = await findIntentByBotId(meeting.botId);
    const owned =
      userOwnsCapturedMeeting(meeting, email, intents) ||
      (!meeting.createdByEmail &&
        (!intent?.createdByEmail || intent.createdByEmail === email));
    if (!owned) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      meeting: {
        id: meeting.id,
        title: meeting.title,
        createdAt: meeting.createdAt,
        botId: meeting.botId,
        meeting: meeting.meeting,
        participants: meeting.participants,
        utterances: meeting.utterances,
        analysis: meeting.analysis,
      },
    });
  }

  const meetings = await listCapturedMeetingsForEmail(email);
  return NextResponse.json({
    meetings: meetings.map((m) => ({
      id: m.id,
      title: m.title,
      createdAt: m.createdAt,
      botId: m.botId,
      meeting: m.meeting,
      participants: m.participants,
      utterances: m.utterances,
      analysis: m.analysis,
    })),
  });
}
