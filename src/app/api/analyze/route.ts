import { NextResponse } from "next/server";
import { analyzeMeeting } from "@/lib/ai/groq";
import { parseTranscript } from "@/lib/ai/parse-transcript";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string;
      transcript?: string;
      utterances?: unknown;
    };

    const title =
      typeof body.title === "string" && body.title.trim()
        ? body.title.trim()
        : "Untitled meeting";

    let utterances = parseTranscript(
      typeof body.transcript === "string" ? body.transcript : "",
    );

    // Allow pre-parsed utterances for testing
    if (
      utterances.length === 0 &&
      Array.isArray(body.utterances) &&
      body.utterances.length > 0
    ) {
      utterances = body.utterances
        .map((u, i) => {
          if (!u || typeof u !== "object") return null;
          const o = u as Record<string, unknown>;
          const text = typeof o.text === "string" ? o.text.trim() : "";
          if (!text) return null;
          return {
            id: typeof o.id === "string" ? o.id : `u${i + 1}`,
            speaker:
              typeof o.speaker === "string" ? o.speaker : "Unknown",
            timestamp:
              typeof o.timestamp === "string" ? o.timestamp : "00:00",
            startTime:
              typeof o.startTime === "number" ? o.startTime : i,
            text,
          };
        })
        .filter((u): u is NonNullable<typeof u> => u !== null);
    }

    if (utterances.length === 0) {
      return NextResponse.json(
        { error: "Could not parse any utterances from the transcript." },
        { status: 400 },
      );
    }

    const analysis = await analyzeMeeting(utterances);

    return NextResponse.json({
      title,
      utterances,
      analysis,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    const status = message.includes("GROQ_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
