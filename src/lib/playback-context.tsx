"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Meeting } from "@/data/types";
import { findUtteranceAtTime } from "@/data/meetings";

export type DetailTab = "summary" | "actions" | "transcript";

interface PlaybackContextValue {
  meeting: Meeting;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackRate: number;
  activeUtteranceId: string | null;
  followPlayback: boolean;
  tab: DetailTab;
  setTab: (tab: DetailTab) => void;
  setFollowPlayback: (v: boolean) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (time: number, opts?: { play?: boolean }) => void;
  skip: (delta: number) => void;
  setPlaybackRate: (rate: number) => void;
  jumpToEvidence: (utteranceId: string) => void;
  registerAudio: (el: HTMLAudioElement | null) => void;
}

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

export function PlaybackProvider({
  meeting,
  children,
  initialTab = "summary",
}: {
  meeting: Meeting;
  children: ReactNode;
  initialTab?: DetailTab;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(meeting.durationSec);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [followPlayback, setFollowPlayback] = useState(true);
  const [tab, setTab] = useState<DetailTab>(initialTab);

  const activeUtteranceId = useMemo(() => {
    const u = findUtteranceAtTime(meeting, currentTime);
    return u?.id ?? null;
  }, [meeting, currentTime]);

  const registerAudio = useCallback((el: HTMLAudioElement | null) => {
    audioRef.current = el;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [meeting.id]);

  const play = useCallback(() => {
    void audioRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  }, []);

  const seek = useCallback((time: number, opts?: { play?: boolean }) => {
    const audio = audioRef.current;
    // Text-only / AI-generated meetings may have no audio — still update time for highlight
    if (!audio || !meeting.audioSrc) {
      setCurrentTime(Math.max(0, time));
      return;
    }
    const clamped = Math.max(0, Math.min(time, audio.duration || time));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
    if (opts?.play) void audio.play();
  }, [meeting.audioSrc]);

  const skip = useCallback(
    (delta: number) => {
      seek((audioRef.current?.currentTime ?? currentTime) + delta);
    },
    [currentTime, seek],
  );

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, []);

  const jumpToEvidence = useCallback(
    (utteranceId: string) => {
      const u = meeting.transcript.find((x) => x.id === utteranceId);
      if (!u) return;
      setTab("transcript");
      setFollowPlayback(true);
      seek(u.startTime, { play: Boolean(meeting.audioSrc) });
    },
    [meeting.transcript, meeting.audioSrc, seek],
  );

  const value: PlaybackContextValue = {
    meeting,
    currentTime,
    duration,
    isPlaying,
    playbackRate,
    activeUtteranceId,
    followPlayback,
    tab,
    setTab,
    setFollowPlayback,
    play,
    pause,
    toggle,
    seek,
    skip,
    setPlaybackRate,
    jumpToEvidence,
    registerAudio,
  };

  return (
    <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error("usePlayback must be used within PlaybackProvider");
  return ctx;
}
