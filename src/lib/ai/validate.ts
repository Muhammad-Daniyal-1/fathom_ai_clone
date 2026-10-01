import {
  OUTCOME_TYPES,
  type AiKeyTakeaway,
  type AiNextStep,
  type AiOutcome,
  type AiOutcomeType,
  type AiSummary,
  type AiTopic,
  type CanonicalAnalysis,
  type ParsedUtterance,
} from "./schemas";

function asString(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return fallback;
}

function asNullableString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = asString(v);
  return s.length ? s : null;
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function asConfidence(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}

function filterEvidenceIds(ids: unknown, valid: Set<string>): string[] {
  const arr = asArray(ids);
  const out: string[] = [];
  for (const id of arr) {
    if (typeof id === "string" && valid.has(id) && !out.includes(id)) {
      out.push(id);
    }
  }
  return out;
}

function isOutcomeType(v: unknown): v is AiOutcomeType {
  return typeof v === "string" && (OUTCOME_TYPES as readonly string[]).includes(v);
}

function normalizeTakeaway(
  raw: unknown,
  valid: Set<string>,
): AiKeyTakeaway | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const text = asString(o.text);
  if (!text) return null;
  return { text, evidenceIds: filterEvidenceIds(o.evidenceIds, valid) };
}

function normalizeTopic(raw: unknown, valid: Set<string>): AiTopic | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const title = asString(o.title);
  if (!title) return null;
  return {
    title,
    summary: asString(o.summary),
    evidenceIds: filterEvidenceIds(o.evidenceIds, valid),
  };
}

function normalizeNextStep(
  raw: unknown,
  valid: Set<string>,
): AiNextStep | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const text = asString(o.text);
  if (!text) return null;
  return {
    text,
    owner: asNullableString(o.owner),
    due: asNullableString(o.due),
    evidenceIds: filterEvidenceIds(o.evidenceIds, valid),
  };
}

function normalizeOutcome(
  raw: unknown,
  valid: Set<string>,
): AiOutcome | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (!isOutcomeType(o.type)) return null;
  const title = asString(o.title);
  if (!title) return null;
  const evidenceIds = filterEvidenceIds(o.evidenceIds, valid);
  // Drop outcomes with no valid evidence — never fabricate clickable refs
  if (evidenceIds.length === 0) return null;

  const statusRaw = asNullableString(o.status);
  const status =
    statusRaw === "open" || statusRaw === "done" ? statusRaw : null;

  return {
    type: o.type,
    title,
    description: asString(o.description),
    owner: asNullableString(o.owner),
    due: asNullableString(o.due),
    status,
    confidence: asConfidence(o.confidence),
    evidenceIds,
    previousValue: asNullableString(o.previousValue),
    newValue: asNullableString(o.newValue),
  };
}

function normalizeSummary(raw: unknown, valid: Set<string>): AiSummary {
  const o =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  return {
    purpose: asString(o.purpose, "Meeting discussion."),
    keyTakeaways: asArray(o.keyTakeaways)
      .map((x) => normalizeTakeaway(x, valid))
      .filter((x): x is AiKeyTakeaway => x !== null),
    topics: asArray(o.topics)
      .map((x) => normalizeTopic(x, valid))
      .filter((x): x is AiTopic => x !== null),
    nextSteps: asArray(o.nextSteps)
      .map((x) => normalizeNextStep(x, valid))
      .filter((x): x is AiNextStep => x !== null),
  };
}

/** Extract JSON object from model text (handles markdown fences). */
export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1].trim() : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response did not contain a JSON object");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

export function validateCanonicalAnalysis(
  raw: unknown,
  utterances: ParsedUtterance[],
): CanonicalAnalysis {
  const valid = new Set(utterances.map((u) => u.id));
  const obj =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  return {
    summary: normalizeSummary(obj.summary, valid),
    outcomes: asArray(obj.outcomes)
      .map((x) => normalizeOutcome(x, valid))
      .filter((x): x is AiOutcome => x !== null),
  };
}
