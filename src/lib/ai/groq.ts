import Groq from "groq-sdk";
import type { CanonicalAnalysis, ParsedUtterance } from "./schemas";
import { extractJsonObject, validateCanonicalAnalysis } from "./validate";

function getClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  return {
    client: new Groq({ apiKey }),
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  };
}

const PROXY_ENV_KEYS = [
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "http_proxy",
  "https_proxy",
  "ALL_PROXY",
  "all_proxy",
] as const;

/** Avoid broken local proxy tunnels that block api.groq.com in some dev environments. */
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

async function groqChat(
  system: string,
  user: string,
  opts?: { temperature?: number; jsonMode?: boolean },
): Promise<string> {
  const { client, model } = getClient();
  const temperature = opts?.temperature ?? 0.2;
  const jsonMode = opts?.jsonMode !== false;

  return withClearedProxy(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const completion: any = await client.chat.completions.create({
        model,
        temperature,
        max_completion_tokens: 4096,
        response_format: jsonMode ? { type: "json_object" } : undefined,
        reasoning_effort: "medium",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const content = completion.choices?.[0]?.message?.content as
        | string
        | undefined;
      if (!content) {
        throw new Error("Groq returned an empty response");
      }
      return content;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // Retry without optional params if the model rejects them
      if (
        message.includes("response_format") ||
        message.includes("reasoning_effort") ||
        message.includes("400")
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const completion: any = await client.chat.completions.create({
          model,
          temperature,
          max_completion_tokens: 4096,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        });
        const content = completion.choices?.[0]?.message?.content as
          | string
          | undefined;
        if (!content) {
          throw new Error("Groq returned an empty response");
        }
        return content;
      }
      if (message.includes("fetch failed") || message.includes("ENOTFOUND")) {
        throw new Error(
          "Unable to reach Groq API. Check network and GROQ_API_KEY.",
        );
      }
      throw err instanceof Error ? err : new Error(message);
    }
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

  const content = await groqChat(ANALYZE_SYSTEM, user, {
    temperature: 0.2,
    jsonMode: true,
  });

  const parsed = extractJsonObject(content);
  return validateCanonicalAnalysis(parsed, utterances);
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

  const content = await groqChat(ASK_SYSTEM, user, {
    temperature: 0.2,
    jsonMode: true,
  });

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
