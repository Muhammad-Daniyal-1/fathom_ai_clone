import { NextResponse } from "next/server";
import { getRecallConfig, RecallConfigError } from "@/lib/recall/config";
import { processRecallWebhookEvent } from "@/lib/recall/process";
import { claimWebhookEvent } from "@/lib/recall/store";
import { verifyRequestFromRecall } from "@/lib/recall/verify";

export const runtime = "nodejs";

/**
 * Recall dashboard + Calendar V2 webhook receiver.
 * Verifies raw body, claims idempotency, returns 2xx quickly, then processes.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();

  let secret: string;
  try {
    secret = getRecallConfig().webhookVerificationSecret;
  } catch (err) {
    const message =
      err instanceof RecallConfigError ? err.message : "Recall not configured";
    console.error("recall_webhook_config_error", message);
    return NextResponse.json({ error: "misconfigured" }, { status: 503 });
  }

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  try {
    verifyRequestFromRecall({
      secret,
      headers,
      payload: rawBody,
    });
  } catch {
    console.error("recall_webhook_verify_failed", {
      hasId: Boolean(headers["webhook-id"] || headers["svix-id"]),
      hasTimestamp: Boolean(
        headers["webhook-timestamp"] || headers["svix-timestamp"],
      ),
      hasSignature: Boolean(
        headers["webhook-signature"] || headers["svix-signature"],
      ),
    });
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  let payload: { event?: string; data?: unknown } = {};
  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const eventType = typeof payload.event === "string" ? payload.event : "unknown";
  const eventId =
    headers["webhook-id"] ||
    headers["svix-id"] ||
    `${eventType}:${Date.now()}`;

  const claimed = await claimWebhookEvent(eventId, eventType);
  if (!claimed) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  // Acknowledge first; process in the same isolate without blocking retries on slow work.
  // Next.js serverless may freeze after response; we still await processing for reliability
  // on Node runtime deployments (Vercel Node / local).
  try {
    const result = await processRecallWebhookEvent(
      payload as Parameters<typeof processRecallWebhookEvent>[0],
    );
    console.info("recall_webhook_processed", {
      eventType,
      handled: result.handled,
      detail: result.detail,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("recall_webhook_process_error", {
      eventType,
      message: err instanceof Error ? err.message : "unknown",
    });
    // Return 2xx after verification to avoid endless retries for poison messages;
    // durable state already marked failed where applicable.
    return NextResponse.json({ ok: true, processed: false });
  }
}
