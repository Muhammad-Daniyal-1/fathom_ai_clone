import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getCapturedMeeting,
  listCapturedMeetingsForEmail,
} from "@/lib/recall/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (id) {
    const meeting = await getCapturedMeeting(id);
    if (!meeting) {
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

  const meetings = await listCapturedMeetingsForEmail(session.user.email);
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
