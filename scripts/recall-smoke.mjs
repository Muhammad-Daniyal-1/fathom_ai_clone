/**
 * Non-binding smoke: constructs production request handlers in-process and
 * exercises webhook verification + bot route validation without listening.
 *
 * Usage: node --env-file=.env.local scripts/recall-smoke.mjs
 * Exits 0 on success.
 */
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const dataDir = mkdtempSync(path.join(tmpdir(), "brief-recall-smoke-"));
process.env.RECALL_DATA_DIR = dataDir;
process.env.RECALL_REGION ||= "us-east-1";
process.env.RECALL_API_KEY ||= "smoke-test-key";
process.env.RECALL_WEBHOOK_VERIFICATION_SECRET ||=
  `whsec_${Buffer.from("smoke-secret-key-bytes!!!!").toString("base64")}`;
process.env.PUBLIC_API_BASE_URL ||= "https://fathom-ai-clone-blond.vercel.app";
process.env.RECALL_BOT_NAME ||= "Brief Smoke Bot";

async function loadTs(rel) {
  // Prefer compiled-free import via experimental strip types when available.
  const file = path.join(root, rel);
  return import(pathToFileURL(file).href);
}

async function main() {
  const { getRecallConfig } = await loadTs("src/lib/recall/config.ts");
  const { verifyRequestFromRecall, signRecallWebhook } = await loadTs(
    "src/lib/recall/verify.ts",
  );
  const { createPendingIntent, claimWebhookEvent, readStore } = await loadTs(
    "src/lib/recall/store.ts",
  );
  const { shouldRecordCalendarEvent } = await loadTs("src/lib/recall/store.ts");

  const cfg = getRecallConfig(process.env);
  assert.equal(cfg.region, "us-east-1");
  assert.ok(cfg.publicApiBaseUrl.startsWith("https://"));

  const intent = await createPendingIntent({
    meetingUrl: "https://meet.google.com/abc-defg-hij",
    title: "Smoke meeting",
    botName: cfg.botName,
    source: "meeting_url",
  });
  assert.equal(intent.status, "pending_create");
  assert.ok(intent.id.startsWith("intent-"));

  const payload = JSON.stringify({
    event: "bot.joining_call",
    data: { bot: { id: "bot-smoke" }, data: { code: "joining_call" } },
  });
  const msgId = "msg_smoke_1";
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = signRecallWebhook({
    secret: cfg.webhookVerificationSecret,
    msgId,
    timestamp,
    payload,
  });
  verifyRequestFromRecall({
    secret: cfg.webhookVerificationSecret,
    headers: {
      "webhook-id": msgId,
      "webhook-timestamp": timestamp,
      "webhook-signature": signature,
    },
    payload,
  });

  assert.equal(await claimWebhookEvent(msgId, "bot.joining_call"), true);
  assert.equal(await claimWebhookEvent(msgId, "bot.joining_call"), false);

  assert.equal(
    shouldRecordCalendarEvent({
      preference: null,
      event: {
        is_deleted: false,
        meeting_url: "https://meet.google.com/x",
        end_time: new Date(Date.now() + 3600_000).toISOString(),
      },
    }),
    false,
  );

  const store = await readStore();
  assert.ok(store.intents.some((i) => i.id === intent.id));

  // HMAC sanity for docs sample shape
  const key = Buffer.from(
    cfg.webhookVerificationSecret.slice("whsec_".length),
    "base64",
  );
  const expected = createHmac("sha256", key)
    .update(`${msgId}.${timestamp}.${payload}`)
    .digest("base64");
  assert.ok(signature.includes(expected));

  console.log(
    JSON.stringify({
      ok: true,
      intentId: intent.id,
      publicApiBaseUrl: cfg.publicApiBaseUrl,
      webhookPath: "/api/webhooks/recall",
    }),
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => {
    try {
      rmSync(dataDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });
