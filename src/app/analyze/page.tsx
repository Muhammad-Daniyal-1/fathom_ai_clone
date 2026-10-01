"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { productName } from "@/lib/brand";
import {
  EXAMPLE_MEETING_TITLE,
  EXAMPLE_MEETING_TRANSCRIPT,
} from "@/lib/ai/example-transcript";
import { analysisToMeeting } from "@/lib/ai/to-meeting";
import { registerParticipants } from "@/data/meetings";
import { saveGeneratedMeeting } from "@/lib/generated-meetings";
import type { CanonicalAnalysis, ParsedUtterance } from "@/lib/ai/schemas";

const STAGES = [
  "Reading transcript…",
  "Understanding discussion…",
  "Extracting decisions…",
  "Finding commitments…",
  "Grounding evidence…",
  "Building meeting intelligence…",
];

export default function AnalyzeMeetingPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (!loading) return;
    setStageIndex(0);
    const id = window.setInterval(() => {
      setStageIndex((i) => (i + 1) % STAGES.length);
    }, 1800);
    return () => window.clearInterval(id);
  }, [loading]);

  const canSubmit = useMemo(
    () => title.trim().length > 0 && transcript.trim().length > 0 && !loading,
    [title, transcript, loading],
  );

  function loadExample() {
    setTitle(EXAMPLE_MEETING_TITLE);
    setTranscript(EXAMPLE_MEETING_TRANSCRIPT);
    setError(null);
  }

  async function analyze() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          transcript,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        title?: string;
        utterances?: ParsedUtterance[];
        analysis?: CanonicalAnalysis;
      };
      if (!res.ok || !data.analysis || !data.utterances) {
        throw new Error(data.error || "Analysis failed. Please try again.");
      }

      const { meeting, participants } = analysisToMeeting({
        title: data.title || title.trim(),
        utterances: data.utterances,
        analysis: data.analysis,
      });
      registerParticipants(participants);
      saveGeneratedMeeting({
        id: meeting.id,
        title: meeting.title,
        createdAt: new Date().toISOString(),
        meeting,
        participants,
        utterances: data.utterances,
        analysis: data.analysis,
      });
      router.push(`/meetings/${meeting.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[900px] flex-col px-4 py-5 md:px-6">
      <header className="mb-6">
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-white"
        >
          ← Back to My Meetings
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-sm font-bold text-white">
            B
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Analyze Meeting
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Paste an unseen transcript — {productName} extracts decisions,
              commitments, risks, and evidence-linked outcomes with Groq.
            </p>
          </div>
        </div>
      </header>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]/80 p-5 md:p-6">
        <label className="mb-4 block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Meeting title
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            placeholder="e.g. Q4 Mobile Launch Review"
            className="w-full rounded-xl border border-[var(--border)] bg-black/25 px-4 py-3 text-sm outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] disabled:opacity-60"
          />
        </label>

        <label className="mb-4 block">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Transcript
            </span>
            <button
              type="button"
              onClick={loadExample}
              disabled={loading}
              className="text-xs text-[var(--accent)] hover:underline disabled:opacity-50"
            >
              Load example
            </button>
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            disabled={loading}
            rows={16}
            placeholder={`Speaker [00:00]:\nWhat was said…\n\nSpeaker [00:12]:\nNext utterance…`}
            className="w-full resize-y rounded-xl border border-[var(--border)] bg-black/25 px-4 py-3 font-mono text-[13px] leading-relaxed outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] disabled:opacity-60"
          />
        </label>

        {loading && (
          <div className="mb-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <div>
                <div className="text-sm font-medium">{STAGES[stageIndex]}</div>
                <div className="text-xs text-[var(--text-muted)]">
                  One live Groq analysis — results are not precomputed.
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            <div className="font-medium">Analysis failed</div>
            <p className="mt-1 text-red-100/80">{error}</p>
            <p className="mt-2 text-xs text-red-100/60">
              Your transcript was preserved — you can retry.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void analyze()}
            disabled={!canSubmit}
            className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Analyzing…" : "Analyze meeting"}
          </button>
          <button
            type="button"
            onClick={loadExample}
            disabled={loading}
            className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm text-white/80 hover:border-[var(--accent)] disabled:opacity-40"
          >
            Load example transcript
          </button>
        </div>
      </div>
    </div>
  );
}
