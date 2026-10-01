"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMeeting, registerParticipants } from "@/data/meetings";
import { MeetingDetailView } from "@/components/meetings/MeetingDetailView";
import { getGeneratedMeeting } from "@/lib/generated-meetings";
import type { Meeting, Participant } from "@/data/types";

export function MeetingLoader({
  id,
  backHref = "/dashboard",
}: {
  id: string;
  backHref?: string;
}) {
  const seeded = getMeeting(id);
  const [meeting, setMeeting] = useState<Meeting | null>(seeded ?? null);
  const [ready, setReady] = useState(Boolean(seeded));

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (seeded) {
        setMeeting(seeded);
        setReady(true);
        return;
      }

      const stored = getGeneratedMeeting(id);
      if (stored) {
        registerParticipants(stored.participants);
        if (!cancelled) {
          setMeeting(stored.meeting);
          setReady(true);
        }
        return;
      }

      try {
        const res = await fetch(
          `/api/recall/meetings?id=${encodeURIComponent(id)}`,
        );
        if (res.ok) {
          const data = (await res.json()) as {
            meeting?: {
              id: string;
              title: string;
              createdAt: string;
              meeting: Meeting;
              participants: Participant[];
              utterances?: import("@/lib/ai/schemas").ParsedUtterance[];
              analysis?: import("@/lib/ai/schemas").CanonicalAnalysis | null;
            };
          };
          if (data.meeting?.meeting) {
            registerParticipants(data.meeting.participants ?? []);
            if (
              data.meeting.utterances &&
              data.meeting.analysis
            ) {
              const { saveGeneratedMeeting } = await import(
                "@/lib/generated-meetings"
              );
              const meeting = {
                ...data.meeting.meeting,
                source: data.meeting.meeting.source ?? ("recall" as const),
                groupLabel: data.meeting.meeting.groupLabel || "Captured",
              };
              saveGeneratedMeeting({
                id: data.meeting.id || meeting.id,
                title: data.meeting.title || meeting.title,
                createdAt:
                  data.meeting.createdAt || new Date().toISOString(),
                meeting,
                participants: data.meeting.participants ?? [],
                utterances: data.meeting.utterances,
                analysis: data.meeting.analysis,
                source: "recall",
              });
              if (!cancelled) {
                setMeeting(meeting);
                setReady(true);
                return;
              }
            }
            if (!cancelled) {
              setMeeting(data.meeting.meeting);
              setReady(true);
              return;
            }
          }
        }
      } catch {
        // fall through to not found
      }

      if (!cancelled) {
        setMeeting(null);
        setReady(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id, seeded]);

  if (!ready) {
    return (
      <div className="p-8 text-sm text-[var(--text-muted)]">Loading meeting…</div>
    );
  }

  if (!meeting) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Meeting not found</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          This meeting is not in the library. Generated meetings are stored in
          this browser; captured Recall meetings live on the server.
        </p>
        <Link
          href={backHref}
          className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm text-white"
        >
          {backHref === "/dashboard" ? "Back to My Meetings" : "Back to home"}
        </Link>
      </div>
    );
  }

  return <MeetingDetailView meeting={meeting} backHref={backHref} />;
}
