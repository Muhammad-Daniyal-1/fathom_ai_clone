"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { productName } from "@/lib/brand";

type CalendarRow = {
  calendarId: string;
  platform: string;
  platformEmail: string | null;
  status: string;
};

type EventRow = {
  id: string;
  calendar_id: string;
  start_time: string;
  end_time: string;
  meeting_url: string | null;
  record: boolean;
  raw?: { summary?: string; subject?: string };
  bots?: unknown[];
};

export function CalendarHomeClient() {
  const [calendars, setCalendars] = useState<CalendarRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [optInRule, setOptInRule] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [calRes, evRes] = await Promise.all([
      fetch("/api/recall/calendar"),
      fetch("/api/recall/calendar/events"),
    ]);
    if (calRes.ok) {
      const data = (await calRes.json()) as {
        calendars?: CalendarRow[];
        optInRule?: string;
      };
      setCalendars(data.calendars ?? []);
      setOptInRule(data.optInRule ?? "");
    }
    if (evRes.ok) {
      const data = (await evRes.json()) as { events?: EventRow[] };
      setEvents(data.events ?? []);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function toggleRecord(event: EventRow, record: boolean) {
    setBusyId(event.id);
    setError(null);
    try {
      const title =
        event.raw?.summary || event.raw?.subject || "Calendar meeting";
      const res = await fetch("/api/recall/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_preference",
          calendarEventId: event.id,
          calendarId: event.calendar_id,
          record,
          meetingUrl: event.meeting_url,
          title,
          startTime: event.start_time,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Failed to update preference");
        return;
      }
      await refresh();
    } catch {
      setError("Network error updating preference");
    } finally {
      setBusyId(null);
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
          href="/capture"
          className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-white/80 hover:border-[var(--accent)]"
        >
          Launch bot
        </Link>
      </header>

      <h1 className="text-2xl font-semibold tracking-tight">Calendar recording</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        {optInRule ||
          "Connecting a calendar syncs events. Recording stays opt-in per meeting."}
      </p>

      <section className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
        <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Connected calendars
        </h2>
        {calendars.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            No calendar connected yet. Complete Google Calendar V2 setup (OAuth
            app + first mailbox authorize), then the connection will appear
            here.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {calendars.map((c) => (
              <li key={c.calendarId} className="text-sm">
                <span className="font-medium">
                  {c.platformEmail || c.calendarId}
                </span>
                <span className="ml-2 text-[var(--text-muted)]">
                  {c.platform} · {c.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error && (
        <p className="mt-4 text-sm text-rose-300" role="alert">
          {error}
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Upcoming events</h2>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            No synced events yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {events.map((event) => {
              const title =
                event.raw?.summary || event.raw?.subject || "Untitled event";
              const start = new Date(event.start_time).toLocaleString();
              return (
                <li
                  key={event.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium">{title}</div>
                      <div className="mt-1 text-xs text-[var(--text-muted)]">
                        {start}
                      </div>
                      <div className="mt-1 truncate text-xs text-[var(--text-muted)]">
                        {event.meeting_url || "No meeting URL"}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={
                        busyId === event.id ||
                        (!event.meeting_url && !event.record)
                      }
                      onClick={() => void toggleRecord(event, !event.record)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                        event.record
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "border border-[var(--border)] text-white/80"
                      } disabled:opacity-40`}
                    >
                      {busyId === event.id
                        ? "Saving…"
                        : event.record
                          ? "Recording on"
                          : "Record with Brief"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
