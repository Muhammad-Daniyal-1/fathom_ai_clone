import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CaptureBotClient } from "@/components/recall/CaptureBotClient";

export default async function CapturePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-[var(--text-muted)]">
          Loading capture…
        </div>
      }
    >
      <CaptureBotClient />
    </Suspense>
  );
}
