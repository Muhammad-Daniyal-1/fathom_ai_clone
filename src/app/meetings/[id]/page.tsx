import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getMeeting } from "@/data/meetings";
import { MeetingDetailView } from "@/components/meetings/MeetingDetailView";

export default async function MeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meeting = getMeeting(id);
  if (!meeting) notFound();

  return (
    <Suspense fallback={<div className="p-8 text-sm text-[var(--text-muted)]">Loading…</div>}>
      <MeetingDetailView meeting={meeting} />
    </Suspense>
  );
}
