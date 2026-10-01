import { Suspense } from "react";
import { meetings } from "@/data/meetings";
import { MeetingLoader } from "@/components/meetings/MeetingLoader";

export function generateStaticParams() {
  return meetings.map((m) => ({ id: m.id }));
}

export default async function MeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-[var(--text-muted)]">Loading…</div>
      }
    >
      <MeetingLoader id={id} />
    </Suspense>
  );
}
