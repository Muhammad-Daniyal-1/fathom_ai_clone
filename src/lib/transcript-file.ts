/** Client-side limit for .txt uploads (~512 KB of transcript text). */
export const MAX_TRANSCRIPT_FILE_BYTES = 512 * 1024;

export class TranscriptFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TranscriptFileError";
  }
}

function isTxtFile(file: File): boolean {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".txt")) return true;
  return file.type.toLowerCase() === "text/plain";
}

function titleFromFilename(name: string): string {
  return name.replace(/\.txt$/i, "").replace(/[-_]+/g, " ").trim();
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Read a local .txt file into transcript text. No server upload.
 */
export async function readTranscriptTxtFile(
  file: File,
): Promise<{ text: string; filename: string; sizeBytes: number }> {
  if (!isTxtFile(file)) {
    throw new TranscriptFileError("Please upload a .txt transcript.");
  }

  if (file.size === 0) {
    throw new TranscriptFileError("This transcript file is empty.");
  }

  if (file.size > MAX_TRANSCRIPT_FILE_BYTES) {
    throw new TranscriptFileError(
      `This file is too large (max ${formatBytes(MAX_TRANSCRIPT_FILE_BYTES)}). Try a shorter transcript or paste a portion.`,
    );
  }

  let text: string;
  try {
    text = await file.text();
  } catch {
    throw new TranscriptFileError(
      "We couldn't read this file. Try another .txt file.",
    );
  }

  if (!text.trim()) {
    throw new TranscriptFileError("This transcript file is empty.");
  }

  return { text, filename: file.name, sizeBytes: file.size };
}

export { titleFromFilename };
