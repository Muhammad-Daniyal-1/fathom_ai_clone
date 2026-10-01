import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Customer-owned Calendar V2 OAuth callback.
 * Forwards only state/code/error/recall_calendar_setup_probe to Recall's
 * regional_callback_uri provided during setup (via RELAY_TARGET query or env).
 *
 * During MCP-managed setup, start_calendar_integration_setup returns the
 * regional URI; we store it in RECALL_CALENDAR_REGIONAL_CALLBACK_URI for
 * development, or accept ?relay= for the setup probe URL path.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const probe = url.searchParams.get("recall_calendar_setup_probe");

  const regional =
    process.env.RECALL_CALENDAR_REGIONAL_CALLBACK_URI?.trim() ||
    url.searchParams.get("relay")?.trim() ||
    "";

  if (!regional) {
    console.error("calendar_callback_missing_regional_uri");
    return NextResponse.json(
      {
        error:
          "Calendar callback is not configured. Set RECALL_CALENDAR_REGIONAL_CALLBACK_URI from Calendar V2 setup.",
      },
      { status: 503 },
    );
  }

  if (!state) {
    return NextResponse.json({ error: "Missing state" }, { status: 400 });
  }

  // Probe is valid without code/error.
  const hasAuthResult = Boolean(code || error);
  if (!probe && !hasAuthResult) {
    return NextResponse.json(
      { error: "Expected code, error, or recall_calendar_setup_probe" },
      { status: 400 },
    );
  }

  let target: URL;
  try {
    target = new URL(regional);
  } catch {
    return NextResponse.json({ error: "Invalid regional callback URI" }, { status: 500 });
  }

  // Forward only the allowed params — never log values.
  target.searchParams.set("state", state);
  if (code) target.searchParams.set("code", code);
  if (error) target.searchParams.set("error", error);
  if (probe) target.searchParams.set("recall_calendar_setup_probe", probe);

  console.info("calendar_callback_forward", {
    hasCode: Boolean(code),
    hasError: Boolean(error),
    hasProbe: Boolean(probe),
  });

  return NextResponse.redirect(target.toString(), 302);
}
