"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMeeting, registerParticipants } from "@/data/meetings";
import { MeetingDetailView } from "@/components/meetings/MeetingDetailView";
import { getGeneratedMeeting } from "@/lib/generated-meetings";
import type { Meeting } from "@/data/types";

export function MeetingLoader({ id }: { id: string }) {
  const seeded = getMeeting(id);
  const [meeting, setMeeting] = useState<Meeting | null>(seeded ?? null);
  const [ready, setReady] = useState(Boolean(seeded));

  useEffect(() => {
    if (seeded) {
      setMeeting(seeded);
      setReady(true);
      return;
    }
    const stored = getGeneratedMeeting(id);
    if (stored) {
      registerParticipants(stored.participants);
      setMeeting(stored.meeting);
    }
    setReady(true);
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
          this browser only.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm text-white"
        >
          Back to My Meetings
        </Link>
      </div>
    );
  }

  return <MeetingDetailView meeting={meeting} />;
}
