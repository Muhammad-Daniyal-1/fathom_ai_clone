import type { ParsedUtterance } from "./schemas";

/** Parse "MM:SS" or "H:MM:SS" into seconds. */
export function parseTimestamp(ts: string): number {
  const parts = ts.trim().split(":").map((p) => Number(p));
  if (parts.some((n) => Number.isNaN(n))) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

/**
 * Parse a simple speaker/timestamp transcript into deterministic utterances.
 *
 * Expected format:
 *   Speaker [MM:SS]:
 *   Text line(s)
 */
export function parseTranscript(raw: string): ParsedUtterance[] {
  const text = raw.replace(/\r\n/g, "\n").trim();
  if (!text) return [];

  const headerRe =
    /^([^\n\[\]]+?)\s*\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*:?\s*$/;

  const lines = text.split("\n");
  const utterances: ParsedUtterance[] = [];
  let current: { speaker: string; timestamp: string; lines: string[] } | null =
    null;

  function flush() {
    if (!current) return;
    const body = current.lines.join(" ").replace(/\s+/g, " ").trim();
    if (body) {
      const id = `u${utterances.length + 1}`;
      utterances.push({
        id,
        speaker: current.speaker.trim(),
        timestamp: current.timestamp,
        startTime: parseTimestamp(current.timestamp),
        text: body,
      });
    }
    current = null;
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      // blank line separates utterances but keep collecting if mid-utterance
      continue;
    }
    const match = trimmed.match(headerRe);
    if (match) {
      flush();
      current = {
        speaker: match[1].trim(),
        timestamp: match[2],
        lines: [],
      };
      continue;
    }

    // Inline form: "Speaker [00:00]: text on same line"
    const inline = trimmed.match(
      /^([^\n\[\]]+?)\s*\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*:\s*(.+)$/,
    );
    if (inline) {
      flush();
      current = {
        speaker: inline[1].trim(),
        timestamp: inline[2],
        lines: [inline[3]],
      };
      continue;
    }

    if (current) {
      current.lines.push(trimmed);
    } else {
      // Orphan line — attach as anonymous utterance so we don't drop content
      const id = `u${utterances.length + 1}`;
      utterances.push({
        id,
        speaker: "Unknown",
        timestamp: "00:00",
        startTime: utterances.length > 0
          ? utterances[utterances.length - 1].startTime + 1
          : 0,
        text: trimmed,
      });
    }
  }

  flush();
  return utterances;
}
