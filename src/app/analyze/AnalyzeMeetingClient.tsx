"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { productName } from "@/lib/brand";
import {
  EXAMPLE_MEETING_TITLE,
  EXAMPLE_MEETING_TRANSCRIPT,
} from "@/lib/ai/example-transcript";
import { analysisToMeeting } from "@/lib/ai/to-meeting";
import { registerParticipants } from "@/data/meetings";
import { saveGeneratedMeeting } from "@/lib/generated-meetings";
import {
  formatBytes,
  readTranscriptTxtFile,
  titleFromFilename,
  TranscriptFileError,
} from "@/lib/transcript-file";
import type { CanonicalAnalysis, ParsedUtterance } from "@/lib/ai/schemas";

const STAGES = [
  "Reading transcript…",
  "Understanding discussion…",
  "Extracting decisions…",
  "Finding commitments…",
  "Grounding evidence…",
  "Building meeting intelligence…",
];

function formatAnalyzeError(message: string): string {
  if (message.includes("GROQ_API_KEY")) {
    return "Analysis is temporarily unavailable. Please try again later.";
  }
  if (message.includes("Could not parse any utterances")) {
    return "We couldn't parse this transcript. Use Speaker [MM:SS]: lines and try again.";
  }
  if (message.includes("Unable to reach Groq")) {
    return "We couldn't reach the analysis service. Please try again.";
  }
  if (message.includes("No utterances")) {
    return "We couldn't parse this transcript. Check the format and try again.";
  }
  if (message.length > 220) {
    return "We couldn't analyze this meeting. Please try again.";
  }
  return message;
}

export default function AnalyzeMeetingClient({
  backHref,
}: {
  backHref: string;
}) {
  const router = useRouter();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loadedFile, setLoadedFile] = useState<{
    name: string;
    sizeBytes: number;
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
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

  const applyFileText = useCallback(
    (text: string, meta: { name: string; sizeBytes: number }) => {
      setTranscript(text);
      setLoadedFile(meta);
      setUploadError(null);
      setError(null);
      setTitle((prev) => {
        if (prev.trim()) return prev;
        const fromName = titleFromFilename(meta.name);
        return fromName || prev;
      });
    },
    [],
  );

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length || loading) return;
      const file = files[0];
      setUploadError(null);
      try {
        const result = await readTranscriptTxtFile(file);
        applyFileText(result.text, {
          name: result.filename,
          sizeBytes: result.sizeBytes,
        });
      } catch (err) {
        setLoadedFile(null);
        const message =
          err instanceof TranscriptFileError
            ? err.message
            : "We couldn't read this file. Try another .txt file.";
        setUploadError(message);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [applyFileText, loading],
  );

  function loadExample() {
    setTitle(EXAMPLE_MEETING_TITLE);
    setTranscript(EXAMPLE_MEETING_TRANSCRIPT);
    setError(null);
    setUploadError(null);
    setLoadedFile(null);
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
        throw new Error(
          data.error || "We couldn't analyze this meeting. Please try again.",
        );
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
      const raw = err instanceof Error ? err.message : "Analysis failed.";
      setError(formatAnalyzeError(raw));
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[900px] flex-col px-4 py-5 md:px-6">
      <header className="mb-6">
        <Link
          href={backHref}
          className="mb-3 inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-white"
        >
          {backHref === "/dashboard"
            ? "← Back to My Meetings"
            : "← Back to home"}
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-sm font-bold text-white">
            B
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Analyze a Meeting
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
              Import a meeting transcript and {productName} will extract
              summaries, decisions, action items, risks, and evidence-backed
              insights.
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

        <div className="mb-4">
          <span
            id={`${fileInputId}-label`}
            className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]"
          >
            Upload transcript
          </span>
          <input
            ref={fileInputRef}
            id={fileInputId}
            type="file"
            accept=".txt,text/plain"
            disabled={loading}
            className="sr-only"
            onChange={(e) => void handleFiles(e.target.files)}
          />
          <div
            role="group"
            aria-labelledby={`${fileInputId}-label`}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!loading) setIsDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!loading) setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOver(false);
              if (!loading) void handleFiles(e.dataTransfer.files);
            }}
            className={`rounded-xl border border-dashed px-4 py-8 text-center transition ${
              isDragOver
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--border-strong)] bg-black/20"
            } ${loading ? "pointer-events-none opacity-60" : ""}`}
          >
            <p className="text-sm font-medium">Upload transcript</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Drop a .txt file here or browse
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 rounded-full border border-[var(--border)] bg-white/[0.04] px-4 py-2 text-sm text-white/90 hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] disabled:opacity-50"
            >
              Browse for .txt
            </button>
            {loadedFile && (
              <p className="mt-4 text-sm text-[var(--success)]">
                ✓ {loadedFile.name}{" "}
                <span className="text-[var(--text-muted)]">
                  ({formatBytes(loadedFile.sizeBytes)})
                </span>
              </p>
            )}
            {uploadError && (
              <p className="mt-4 text-sm text-red-200" role="alert">
                {uploadError}
              </p>
            )}
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
            or
          </span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Paste transcript
          </span>
          <p className="mb-2 text-[11px] text-[var(--text-muted)]">
            Expected format —{" "}
            <span className="font-mono text-white/60">Speaker [00:00]:</span>{" "}
            then what was said on the next line.
          </p>
          <textarea
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              if (uploadError) setUploadError(null);
            }}
            disabled={loading}
            rows={14}
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
                  Analyzing meeting — this result is not precomputed.
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div
            className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100"
            role="alert"
          >
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
            {loading ? "Analyzing meeting…" : "Analyze Meeting"}
          </button>
        </div>

        <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-4 md:p-5">
          <h2 className="text-sm font-semibold tracking-tight">Try the demo</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            See {productName} analyze a realistic product meeting.
          </p>
          <button
            type="button"
            onClick={loadExample}
            disabled={loading}
            className="mt-3 rounded-full border border-[var(--border)] px-4 py-2 text-sm text-white/85 hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] disabled:opacity-40"
          >
            Load Q4 Example
          </button>
        </div>
      </div>
    </div>
  );
}
