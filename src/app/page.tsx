import Link from "next/link";
import { productName } from "@/lib/brand";
import { AUTH_ENTRY_HREF, DEMO_HREF } from "@/lib/routes";
import { ProductPreview } from "@/components/landing/ProductPreview";

const FEATURES = [
  {
    title: "Meeting Bot",
    body: "Send Brief Notetaker to a supported meeting through Recall.ai and capture the conversation as a transcript.",
  },
  {
    title: "AI Meeting Summaries",
    body: "Turn long conversations into concise, structured summaries with purpose, takeaways, and topics.",
  },
  {
    title: "Action Items",
    body: "Extract follow-up work with owners and deadlines when they are explicitly stated.",
  },
  {
    title: "Decisions & Outcomes",
    body: "Capture decisions, commitments, risks, decision changes, and open questions in one place.",
  },
  {
    title: "Evidence-linked Insights",
    body: "Every insight cites transcript evidence so you can verify what was actually said.",
  },
  {
    title: "Ask Brief",
    body: "Ask contextual questions and get grounded answers with clickable evidence.",
  },
] as const;

const STEPS = [
  {
    step: "1",
    title: "Capture or import",
    body: "Send Brief Notetaker to your meeting, paste a transcript, or upload a .txt file.",
  },
  {
    step: "2",
    title: "Brief analyzes the conversation",
    body: "Groq-powered meeting intelligence extracts summaries, decisions, action items, and risks.",
  },
  {
    step: "3",
    title: "Act on the outcome",
    body: "Review decisions, action items, risks and evidence, then ask questions about the meeting.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-bold text-white">
              B
            </span>
            <span className="text-base font-semibold tracking-tight">
              {productName}
            </span>
          </a>

          <nav className="hidden items-center gap-6 text-sm text-[var(--text-muted)] sm:flex">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-white">
              How It Works
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={AUTH_ENTRY_HREF}
              className="rounded-full px-3 py-2 text-sm text-[var(--text-muted)] hover:text-white sm:px-4"
            >
              Sign In
            </Link>
            <Link
              href={AUTH_ENTRY_HREF}
              className="rounded-full bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white hover:brightness-110 sm:px-4"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto max-w-6xl px-4 pb-12 pt-14 md:px-6 md:pb-16 md:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              AI Meeting Intelligence
            </p>
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl md:leading-[1.1]">
              Turn every meeting into actionable intelligence.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
              Send Brief Notetaker to a meeting or import a transcript. Brief
              turns conversations into summaries, decisions, action items,
              risks, and searchable knowledge.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={AUTH_ENTRY_HREF}
                className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white hover:brightness-110"
              >
                Get Started
              </Link>
              <Link
                href={DEMO_HREF}
                className="rounded-full border border-[var(--border-strong)] bg-white/[0.03] px-6 py-3 text-sm font-medium text-white/90 hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
              >
                View Demo
              </Link>
            </div>
            <p className="mt-4 text-xs text-[var(--text-muted)]">
              View Demo opens Analyze Meeting — try the Q4 example transcript
              without signing in.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-5xl md:mt-16">
            <ProductPreview />
          </div>
        </section>

        <section
          id="features"
          className="border-t border-[var(--border)] bg-black/20"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                What Brief delivers today
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                Capabilities that ship in the product — not roadmap theater.
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <li
                  key={f.title}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]/70 p-5"
                >
                  <h3 className="text-base font-semibold tracking-tight">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                    {f.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="how-it-works" className="border-t border-[var(--border)]">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                How it works
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                Capture live meetings or import transcripts — then Brief turns
                the conversation into structured intelligence.
              </p>
            </div>
            <ol className="grid gap-4 md:grid-cols-3">
              {STEPS.map((s) => (
                <li
                  key={s.step}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-5"
                >
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
                    {s.step}
                  </div>
                  <h3 className="text-base font-semibold tracking-tight">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                    {s.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-[var(--border)] bg-black/20">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-6 md:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Turn conversations into decisions.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              Stop losing agreements inside meetings. Capture with Brief
              Notetaker or import a transcript — then review evidence-linked
              knowledge you can search and ask about.
            </p>
            <Link
              href={AUTH_ENTRY_HREF}
              className="mt-8 inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white hover:brightness-110"
            >
              Get Started
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--accent)] text-xs font-bold text-white">
              B
            </span>
            <span className="font-medium text-white/90">{productName}</span>
          </div>
          <p>Built by Muhammad Daniyal</p>
          <a
            href="https://github.com/Muhammad-Daniyal-1"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
