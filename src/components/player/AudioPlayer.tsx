"use client";

import { usePlayback } from "@/lib/playback-context";
import { formatTimestamp } from "@/data/meetings";

export function AudioPlayer() {
  const {
    meeting,
    currentTime,
    duration,
    isPlaying,
    playbackRate,
    toggle,
    skip,
    seek,
    setPlaybackRate,
    registerAudio,
  } = usePlayback();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-black/25 p-3">
      <audio
        ref={registerAudio}
        src={meeting.audioSrc}
        preload="metadata"
        className="hidden"
      />
      <div className="mb-2 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => skip(-10)}
          className="rounded-lg px-2 py-1 text-xs text-[var(--text-muted)] hover:bg-white/5 hover:text-white"
          aria-label="Back 10 seconds"
        >
          −10s
        </button>
        <button
          type="button"
          onClick={toggle}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-lg shadow-blue-500/20"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>
        <button
          type="button"
          onClick={() => skip(10)}
          className="rounded-lg px-2 py-1 text-xs text-[var(--text-muted)] hover:bg-white/5 hover:text-white"
          aria-label="Forward 10 seconds"
        >
          +10s
        </button>
      </div>
      <input
        type="range"
        min={0}
        max={duration || 1}
        step={0.05}
        value={currentTime}
        onChange={(e) => seek(Number(e.target.value))}
        className="w-full accent-[var(--accent)]"
        aria-label="Seek"
      />
      <div className="mt-1 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
        <span>
          {formatTimestamp(currentTime)} / {formatTimestamp(duration)}
        </span>
        <div className="flex items-center gap-2">
          <span>{Math.round(progress)}%</span>
          <select
            value={playbackRate}
            onChange={(e) => setPlaybackRate(Number(e.target.value))}
            className="rounded-md border border-[var(--border)] bg-transparent px-1.5 py-0.5 text-[11px]"
            aria-label="Playback speed"
          >
            {[0.75, 1, 1.25, 1.5, 2].map((r) => (
              <option key={r} value={r}>
                {r}x
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
