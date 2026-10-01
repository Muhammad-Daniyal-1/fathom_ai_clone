import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { productName } from "@/lib/brand";
import { signInWithGoogle } from "@/lib/auth-actions";
import { DEMO_HREF } from "@/lib/routes";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-white"
      >
        ← Back to home
      </Link>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]/80 p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-sm font-bold text-white">
            B
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight">
              {productName}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              AI meeting intelligence
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to {productName}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
          Turn meeting conversations into summaries, decisions, action items,
          and searchable knowledge.
        </p>

        <form action={signInWithGoogle} className="mt-8">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-full border border-[var(--border-strong)] bg-white px-5 py-3 text-sm font-medium text-[#1f1f1f] hover:bg-white/90"
          >
            <GoogleGlyph />
            Continue with Google
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          Or{" "}
          <Link
            href={DEMO_HREF}
            className="text-[var(--accent)] hover:underline"
          >
            View Demo
          </Link>{" "}
          without signing in.
        </p>
      </div>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}
