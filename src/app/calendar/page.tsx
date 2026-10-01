import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CalendarHomeClient } from "@/components/recall/CalendarHomeClient";

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <CalendarHomeClient />;
}
