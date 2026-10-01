import { auth } from "@/auth";
import AnalyzeMeetingClient from "./AnalyzeMeetingClient";

export default async function AnalyzeMeetingPage() {
  const session = await auth();
  const backHref = session?.user ? "/dashboard" : "/";

  return <AnalyzeMeetingClient backHref={backHref} />;
}
