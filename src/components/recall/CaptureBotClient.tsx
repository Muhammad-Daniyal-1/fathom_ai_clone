"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { productName } from "@/lib/brand";
import { saveGeneratedMeeting } from "@/lib/generated-meetings";
import type { CanonicalAnalysis, ParsedUtterance } from "@/lib/ai/schemas";
import type { Meeting, Participant } from "@/data/types";

type Intent = {
  id: string;
  meetingUrl: string;
  title: string;
  botId: string | null;
  status: string;
  lastEvent: string | null;
  error: string | null;
  meetingId: string | null;
  updatedAt: string;
};

type MeetingPayload = {
  id: string;
  title: string;
  meeting: Meeting;
  participants: Participant[];
  utterances: ParsedUtterance[];
  analysis: CanonicalAnalysis | null;
  createdAt: string;
};

const STATUS_LABELS: Record<string, string> = {
  pending_create: "Creating bot…",
  scheduled: "Joining meeting…",
  joining: "Joining / waiting for admission…",
  in_call: "In meeting",
  recording: "Recording",
  processing: "Processing recording…",
  transcribing: "Transcribing…",
  ready: "Meeting ready",
  failed: "Failed",
  fatal: "Fatal error",
};

function persistMeeting(payload: MeetingPayload): string | null {
  if (!payload.analysis) return null;
  const meeting: Meeting = {
    ...payload.meeting,
    source: payload.meeting.source ?? "recall",
    groupLabel: payload.meeting.groupLabel || "Captured",
  };
  saveGeneratedMeeting({
    id: payload.id,
    title: payload.title,
    createdAt: payload.createdAt,
    meeting,
    participants: payload.participants,
    utterances: payload.utterances,
    analysis: payload.analysis,
    source: "recall",
  });
  return payload.id;
}

export function CaptureBotClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [meetingUrl, setMeetingUrl] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intents, setIntents] = useState<Intent[]>([]);
  const [activeBotId, setActiveBotId] = useState<string | null>(null);
  const [readyMeetingId, setReadyMeetingId] = useState<string | null>(null);
  const redirectedRef = useRef<string | null>(null);
  const hydratedImportRef = useRef(false);

  const refreshList = useCallback(async () => {
    const res = await fetch("/api/recall/bots");
    if (!res.ok) return;
    const data = (await res.json()) as { intents?: Intent[] };
    setIntents(data.intents ?? []);
  }, []);

  const syncBot = useCallback(
    async (botId: string, opts?: { redirect?: boolean }) => {
      const res = await fetch(`/api/recall/bots/${encodeURIComponent(botId)}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Bot not found or not owned by this account.");
        }
        return;
      }
      const data = (await res.json()) as {
        intent?: Intent | null;
        status?: string | null;
        meetingId?: string | null;
        meeting?: MeetingPayload | null;
      };
      if (data.meeting) {
        const meetingId = persistMeeting(data.meeting);
        if (meetingId) {
          setReadyMeetingId(meetingId);
          if (
            opts?.redirect !== false &&
            redirectedRef.current !== meetingId
          ) {
            redirectedRef.current = meetingId;
            router.push(`/meetings/${meetingId}`);
          }
        }
      }
      await refreshList();
    },
    [refreshList, router],
  );

  useEffect(() => {
    void refreshList();
    const t = setInterval(() => void refreshList(), 5000);
    return () => clearInterval(t);
  }, [refreshList]);

  // Recover / resume a bot via ?bot= or ?import= (browser finalizes → localStorage).
  useEffect(() => {
    if (hydratedImportRef.current) return;
    const importId =
      searchParams.get("bot") || searchParams.get("import") || null;
    if (!importId) return;
    hydratedImportRef.current = true;
    setActiveBotId(importId);
  }, [searchParams]);

  useEffect(() => {
    if (!activeBotId) return;
    void syncBot(activeBotId);
    const t = setInterval(() => void syncBot(activeBotId), 4000);
    return () => clearInterval(t);
  }, [activeBotId, syncBot]);

  async function launch() {
    setBusy(true);
    setError(null);
    setReadyMeetingId(null);
    redirectedRef.current = null;
    try {
      const res = await fetch("/api/recall/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingUrl: meetingUrl.trim(),
          title: title.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        bot?: { id?: string };
        intent?: Intent;
      };
      if (!res.ok) {
        setError(data.error || "Failed to launch bot");
        return;
      }
      if (data.bot?.id) setActiveBotId(data.bot.id);
      setMeetingUrl("");
      setTitle("");
      await refreshList();
    } catch {
      setError("Network error launching bot");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-6 md:px-6">
      <header className="mb-8 flex items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-sm font-bold text-white">
            B
          </span>
          <span className="text-lg font-semibold">{productName}</span>
        </Link>
        <Link
          href="/analyze"
          className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-white/80 hover:border-[var(--accent)]"
        >
          Analyze transcript
        </Link>
      </header>

      <h1 className="text-2xl font-semibold tracking-tight">
        Capture a Meeting
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
        Send Brief Notetaker to an active Google Meet. The bot joins through
        Recall.ai, records the call, then Brief runs the existing meeting
        intelligence pipeline when the transcript is ready.
      </p>

      {readyMeetingId && (
        <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <div className="text-sm font-medium text-emerald-200">
            Meeting ready
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Saved to your browser library. Opening the meeting…
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link
              href={`/meetings/${readyMeetingId}`}
              className="text-[var(--accent)] hover:underline"
            >
              View Meeting
            </Link>
            <Link href="/dashboard" className="text-white/70 hover:underline">
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
        <label className="block text-sm">
          <span className="mb-1.5 block text-[var(--text-muted)]">
            Google Meet URL
          </span>
          <input
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            placeholder="https://meet.google.com/abc-defg-hij"
            className="w-full rounded-xl border border-[var(--border)] bg-black/20 px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-[var(--text-muted)]">
            Title (optional)
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Weekly sync"
            className="w-full rounded-xl border border-[var(--border)] bg-black/20 px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          />
        </label>
        {error && (
          <p className="text-sm text-rose-300" role="alert">
            {error}
          </p>
        )}
        <button
          type="button"
          disabled={busy || !meetingUrl.trim()}
          onClick={() => void launch()}
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "Sending…" : "Send Brief Notetaker"}
        </button>
        <p className="text-xs text-[var(--text-muted)]">
          Admit the bot in Google Meet if prompted. Keep this page open until
          status shows Meeting ready — Brief then saves it to your library and
          opens the meeting.
        </p>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Recent captures</h2>
        {intents.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            No bots launched yet from this account.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {intents.map((intent) => (
              <li
                key={intent.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">{intent.title}</div>
                  <StatusPill status={intent.status} />
                </div>
                <div className="mt-1 truncate text-xs text-[var(--text-muted)]">
                  {intent.meetingUrl}
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
                  <span>
                    {STATUS_LABELS[intent.status] ?? intent.status}
                  </span>
                  {intent.botId && (
                    <button
                      type="button"
                      className="text-[var(--accent)] hover:underline"
                      onClick={() => {
                        setActiveBotId(intent.botId);
                        void syncBot(intent.botId!, { redirect: true });
                      }}
                    >
                      Refresh status
                    </button>
                  )}
                  {intent.error && (
                    <span className="text-rose-300">{intent.error}</span>
                  )}
                  {intent.meetingId && (
                    <Link
                      href={`/meetings/${intent.meetingId}`}
                      className="text-[var(--accent)] hover:underline"
                      onClick={() => {
                        if (intent.botId) {
                          void syncBot(intent.botId, { redirect: false });
                        }
                      }}
                    >
                      Open meeting
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "ready"
      ? "bg-emerald-500/15 text-emerald-300"
      : status === "failed" || status === "fatal"
        ? "bg-rose-500/15 text-rose-300"
        : "bg-[var(--accent-soft)] text-[var(--accent)]";
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tone}`}
    >
      {status}
    </span>
  );
}
