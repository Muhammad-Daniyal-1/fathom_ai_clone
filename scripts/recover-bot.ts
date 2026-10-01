/**
 * One-off recovery: finalize a Recall bot into the local filesystem store.
 * Usage: npx tsx scripts/recover-bot.ts <bot-uuid>
 * Does NOT write browser localStorage — open /capture?bot=<id> while signed in for that.
 */
import { ensureCapturedMeetingFromBot } from "../src/lib/recall/process.ts";
import { claimBotIntentForEmail, readStore } from "../src/lib/recall/store.ts";
import { RecallClient } from "../src/lib/recall/client.ts";
import { firstBotRecording } from "../src/lib/recall/recordings.ts";
import { titleFromMeetingUrl } from "../src/lib/recall/transcript.ts";

async function main() {
  const botId = process.argv[2];
  if (!botId) {
    console.error("Usage: npx tsx scripts/recover-bot.ts <bot-uuid>");
    process.exit(1);
  }
  const email = process.env.RECOVERY_EMAIL || "recovery@local.test";

  const client = new RecallClient();
  const remote = await client.getBot(botId);
  const meetingUrl =
    typeof remote.meeting_url === "string" ? remote.meeting_url : "";
  const rec = firstBotRecording(remote);
  await claimBotIntentForEmail({
    botId,
    email,
    meetingUrl,
    title: meetingUrl ? titleFromMeetingUrl(meetingUrl) : "Atlas meeting",
    botName: remote.bot_name || "Brief Notetaker",
    recordingId: rec?.id ?? null,
    transcriptId: rec?.media_shortcuts?.transcript?.id ?? null,
    status: "processing",
  });
  const result = await ensureCapturedMeetingFromBot(botId, client);
  const store = await readStore();
  const captured = store.captured.find((c) => c.botId === botId);
  console.log(
    JSON.stringify(
      {
        result,
        meetingId: captured?.id,
        title: captured?.title,
        speakers: captured?.participants?.map((p) => p.name),
        utterances: captured?.utterances?.length,
        purpose: captured?.analysis?.summary?.purpose?.slice(0, 160),
        createdByEmail: captured?.createdByEmail,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
