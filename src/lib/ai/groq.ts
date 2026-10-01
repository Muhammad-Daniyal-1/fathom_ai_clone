import type { CanonicalAnalysis, ParsedUtterance } from "./schemas";
import { extractJsonObject, validateCanonicalAnalysis } from "./validate";

const GROQ_BASE = "https://api.groq.com/openai/v1";

function getConfig() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  return { apiKey, model };
}

const PROXY_ENV_KEYS = [
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "http_proxy",
  "https_proxy",
  "ALL_PROXY",
  "all_proxy",
] as const;

/** Avoid broken local proxy tunnels that block api.groq.com. */
async function withClearedProxy<T>(fn: () => Promise<T>): Promise<T> {
  const saved: Partial<Record<(typeof PROXY_ENV_KEYS)[number], string | undefined>> =
    {};
  for (const key of PROXY_ENV_KEYS) {
    saved[key] = process.env[key];
    delete process.env[key];
  }
  try {
    return await fn();
  } finally {
    for (const key of PROXY_ENV_KEYS) {
      const val = saved[key];
      if (val === undefined) delete process.env[key];
      else process.env[key] = val;
    }
  }
}

async function groqRequest(body: Record<string, unknown>): Promise<string> {
  const { apiKey } = getConfig();

  return withClearedProxy(async () => {
    let res: Response;
    try {
      res = await fetch(`${GROQ_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      const cause =
        err instanceof Error && "cause" in err && err.cause
          ? ` (${String(err.cause)})`
          : "";
      throw new Error(
        `Unable to reach Groq API${cause}. Check network and GROQ_API_KEY.`,
      );
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      // Never echo request headers/body that could contain the key
      throw new Error(
        `Groq request failed (${res.status}): ${errText.slice(0, 400) || res.statusText}`,
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Groq returned an empty response");
    }
    return content;
  });
}

async function groqChat(
  system: string,
  user: string,
  temperature = 0.2,
): Promise<string> {
  const { model } = getConfig();
  return groqRequest({
    model,
    temperature,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: { type: "json_object" },
  });
}

const ANALYZE_SYSTEM = `You are a meeting intelligence engine.

Analyze only the supplied transcript.
Extract information supported by explicit transcript evidence.

Definitions:
DECISION: A choice participants actually made.
COMMITMENT: A participant explicitly agreed, promised or clearly accepted responsibility for an action.
RISK: A concrete issue that may negatively affect the project, launch, deliverable or outcome.
DECISION_CHANGE: A previous date, plan, choice or decision was explicitly replaced with another.
OPEN_QUESTION: An important unresolved question or decision.

Rules:
- Do not turn suggestions into commitments.
- Do not invent owners.
- Do not invent deadlines.
- Do not invent decisions.
- Do not infer certainty that is not present.
- Every extracted item MUST cite one or more utterance IDs supplied in the input.
- Only use existing utterance IDs (like u1, u2, ...). Never invent IDs.
- If evidence is weak, lower confidence or omit the outcome.
- Return only the requested JSON object. No markdown.

JSON shape:
{
  "summary": {
    "purpose": "string",
    "keyTakeaways": [{ "text": "string", "evidenceIds": ["u1"] }],
    "topics": [{ "title": "string", "summary": "string", "evidenceIds": ["u1"] }],
    "nextSteps": [{ "text": "string", "owner": "string|null", "due": "string|null", "evidenceIds": ["u1"] }]
  },
  "outcomes": [
    {
      "type": "decision|commitment|risk|decision_change|open_question",
      "title": "string",
      "description": "string",
      "owner": "string|null",
      "due": "string|null",
      "status": "open|done|null",
      "confidence": 0.0,
      "evidenceIds": ["u1"],
      "previousValue": "string|null",
      "newValue": "string|null"
    }
  ]
}`;

export async function analyzeMeeting(
  utterances: ParsedUtterance[],
): Promise<CanonicalAnalysis> {
  if (utterances.length === 0) {
    throw new Error("No utterances to analyze");
  }

  const transcriptPayload = utterances.map((u) => ({
    id: u.id,
    speaker: u.speaker,
    timestamp: u.timestamp,
    text: u.text,
  }));

  const user = `Analyze this meeting transcript. Utterance IDs are fixed — cite only these IDs.\n\n${JSON.stringify(transcriptPayload, null, 2)}`;

  let content: string;
  try {
    content = await groqChat(ANALYZE_SYSTEM, user);
  } catch (err) {
    // Fallback without response_format if model rejects it
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("response_format") || message.includes("400")) {
      content = await groqChatWithoutJsonMode(ANALYZE_SYSTEM, user);
    } else {
      throw err;
    }
  }

  const parsed = extractJsonObject(content);
  return validateCanonicalAnalysis(parsed, utterances);
}

async function groqChatWithoutJsonMode(
  system: string,
  user: string,
): Promise<string> {
  const { model } = getConfig();
  return groqRequest({
    model,
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
}

const ASK_SYSTEM = `You are a meeting Q&A assistant.

Answer ONLY from the supplied meeting transcript and outcomes.
Do not use outside assumptions.
If the meeting does not establish the answer, explicitly say that the meeting does not establish it.
Cite only supplied utterance IDs. Do not fabricate evidence.
Keep answers concise and useful.
Return only JSON:
{ "answer": "string", "evidenceIds": ["u1"] }`;

export async function askMeeting(input: {
  question: string;
  utterances: ParsedUtterance[];
  outcomes: CanonicalAnalysis["outcomes"];
}): Promise<{ answer: string; evidenceIds: string[] }> {
  const valid = new Set(input.utterances.map((u) => u.id));
  const user = JSON.stringify(
    {
      question: input.question,
      transcript: input.utterances.map((u) => ({
        id: u.id,
        speaker: u.speaker,
        timestamp: u.timestamp,
        text: u.text,
      })),
      outcomes: input.outcomes,
    },
    null,
    2,
  );

  let content: string;
  try {
    content = await groqChat(ASK_SYSTEM, user, 0.3);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("response_format") || message.includes("400")) {
      content = await groqChatWithoutJsonMode(ASK_SYSTEM, user);
    } else {
      throw err;
    }
  }

  const parsed = extractJsonObject(content) as Record<string, unknown>;
  const answer =
    typeof parsed.answer === "string" && parsed.answer.trim()
      ? parsed.answer.trim()
      : "The meeting does not establish a clear answer to that question.";
  const evidenceIds = Array.isArray(parsed.evidenceIds)
    ? parsed.evidenceIds.filter(
        (id): id is string => typeof id === "string" && valid.has(id),
      )
    : [];

  return { answer, evidenceIds };
}
