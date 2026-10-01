export type RecordingLike = {
  id?: string;
  media_shortcuts?: {
    transcript?: { id?: string; data?: { download_url?: string } };
  } | null;
  recording?: RecordingLike;
};

export type BotWithRecordings = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recordings?: Array<any>;
};

/** Normalize flat API recordings[] and nested `{ recording: {...} }` shapes. */
export function firstBotRecording(bot: BotWithRecordings): RecordingLike | null {
  const raw = bot.recordings?.[0] as RecordingLike | undefined;
  if (!raw) return null;
  if (raw.media_shortcuts || raw.id) return raw;
  if (raw.recording && (raw.recording.media_shortcuts || raw.recording.id)) {
    return raw.recording;
  }
  return raw;
}
