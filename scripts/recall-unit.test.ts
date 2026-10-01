import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { firstBotRecording } from "../src/lib/recall/recordings.ts";
import {
  signRecallWebhook,
  verifyRequestFromRecall,
} from "../src/lib/recall/verify.ts";
import { recallTranscriptToUtterances } from "../src/lib/recall/transcript.ts";
import { shouldRecordCalendarEvent } from "../src/lib/recall/store.ts";
import { getRecallConfig } from "../src/lib/recall/config.ts";

const SECRET = `whsec_${Buffer.from("test-secret-key-bytes!!").toString("base64")}`;

test("verifyRequestFromRecall accepts a valid signature", () => {
  const payload = JSON.stringify({ event: "bot.done", data: {} });
  const msgId = "msg_test_1";
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = signRecallWebhook({
    secret: SECRET,
    msgId,
    timestamp,
    payload,
  });
  verifyRequestFromRecall({
    secret: SECRET,
    headers: {
      "webhook-id": msgId,
      "webhook-timestamp": timestamp,
      "webhook-signature": signature,
    },
    payload,
  });
});

test("verifyRequestFromRecall rejects a bad signature", () => {
  assert.throws(() =>
    verifyRequestFromRecall({
      secret: SECRET,
      headers: {
        "webhook-id": "msg_x",
        "webhook-timestamp": "1",
        "webhook-signature": "v1,aaaaaaaa",
      },
      payload: "{}",
    }),
  );
});

test("recallTranscriptToUtterances maps segment words", () => {
  const utterances = recallTranscriptToUtterances([
    {
      participant: { id: 1, name: "Ada" },
      words: [
        {
          text: "Hello ",
          start_timestamp: { relative: 1.2 },
          end_timestamp: { relative: 1.5 },
        },
        {
          text: "world",
          start_timestamp: { relative: 1.5 },
          end_timestamp: { relative: 2.0 },
        },
      ],
    },
  ]);
  assert.equal(utterances.length, 1);
  assert.equal(utterances[0].speaker, "Ada");
  assert.equal(utterances[0].text, "Hello world");
  assert.equal(utterances[0].id, "u1");
});

test("shouldRecordCalendarEvent enforces opt-in and meeting URL", () => {
  const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  assert.equal(
    shouldRecordCalendarEvent({
      preference: {
        calendarEventId: "e1",
        calendarId: "c1",
        record: true,
        meetingUrl: "https://meet.google.com/abc",
        title: "Sync",
        startTime: future,
        updatedAt: future,
      },
      event: {
        is_deleted: false,
        meeting_url: "https://meet.google.com/abc",
        end_time: future,
      },
    }),
    true,
  );
  assert.equal(
    shouldRecordCalendarEvent({
      preference: null,
      event: {
        is_deleted: false,
        meeting_url: "https://meet.google.com/abc",
        end_time: future,
      },
    }),
    false,
  );
  assert.equal(
    shouldRecordCalendarEvent({
      preference: {
        calendarEventId: "e1",
        calendarId: "c1",
        record: true,
        meetingUrl: null,
        title: null,
        startTime: null,
        updatedAt: future,
      },
      event: {
        is_deleted: false,
        meeting_url: null,
        end_time: future,
      },
    }),
    false,
  );
  assert.equal(
    shouldRecordCalendarEvent({
      preference: {
        calendarEventId: "e1",
        calendarId: "c1",
        record: true,
        meetingUrl: "https://meet.google.com/abc",
        title: null,
        startTime: null,
        updatedAt: past,
      },
      event: {
        is_deleted: false,
        meeting_url: "https://meet.google.com/abc",
        end_time: past,
      },
    }),
    false,
  );
});

test("getRecallConfig reads injected env without real credentials file", () => {
  const cfg = getRecallConfig({
    RECALL_REGION: "us-east-1",
    RECALL_API_KEY: "test-key",
    RECALL_WEBHOOK_VERIFICATION_SECRET: SECRET,
    PUBLIC_API_BASE_URL: "https://example.com",
    RECALL_BOT_NAME: "Brief Test",
  });
  assert.equal(cfg.region, "us-east-1");
  assert.equal(cfg.botName, "Brief Test");
  assert.equal(cfg.publicApiBaseUrl, "https://example.com");
});

test("sign helper matches HMAC construction", () => {
  const payload = '{"event":"recording.done"}';
  const msgId = "msg_2";
  const timestamp = "1710000000";
  const expected = createHmac(
    "sha256",
    Buffer.from(SECRET.slice("whsec_".length), "base64"),
  )
    .update(`${msgId}.${timestamp}.${payload}`)
    .digest("base64");
  assert.equal(
    signRecallWebhook({ secret: SECRET, msgId, timestamp, payload }),
    `v1,${expected}`,
  );
});

test("firstBotRecording accepts flat and nested recording shapes", () => {
  const flat = firstBotRecording({
    id: "b1",
    recordings: [
      {
        id: "r1",
        media_shortcuts: { transcript: { id: "t1" } },
      },
    ],
  });
  assert.equal(flat?.id, "r1");
  assert.equal(
    (flat?.media_shortcuts as { transcript?: { id?: string } } | undefined)
      ?.transcript?.id,
    "t1",
  );

  const nested = firstBotRecording({
    id: "b2",
    recordings: [
      {
        recording: {
          id: "r2",
          media_shortcuts: { transcript: { id: "t2" } },
        },
      },
    ],
  });
  assert.equal(nested?.id, "r2");
  assert.equal(nested?.media_shortcuts?.transcript?.id, "t2");
});
