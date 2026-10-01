import { NextResponse } from "next/server";
import { askMeeting } from "@/lib/ai/groq";
import type { CanonicalAnalysis, ParsedUtterance } from "@/lib/ai/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      question?: string;
      transcriptUtterances?: ParsedUtterance[];
      outcomes?: CanonicalAnalysis["outcomes"];
    };

    const question =
      typeof body.question === "string" ? body.question.trim() : "";
    if (!question) {
      return NextResponse.json(
        { error: "Question is required." },
        { status: 400 },
      );
    }

    const utterances = Array.isArray(body.transcriptUtterances)
      ? body.transcriptUtterances
      : [];
    if (utterances.length === 0) {
      return NextResponse.json(
        { error: "Meeting transcript is required." },
        { status: 400 },
      );
    }

    const outcomes = Array.isArray(body.outcomes) ? body.outcomes : [];

    const result = await askMeeting({
      question,
      utterances,
      outcomes,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ask failed";
    const status = message.includes("GROQ_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
