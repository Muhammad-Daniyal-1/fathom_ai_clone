import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verify dashboard / Calendar V2 webhook requests from Recall (Svix-compatible).
 * Must use the raw request body bytes as received.
 */
export function verifyRequestFromRecall(args: {
  secret: string;
  headers: Record<string, string | string[] | undefined>;
  payload: string | null;
}): void {
  const { secret, headers, payload } = args;
  const header = (name: string): string | undefined => {
    const v = headers[name] ?? headers[name.toLowerCase()];
    if (Array.isArray(v)) return v[0];
    return typeof v === "string" ? v : undefined;
  };

  const msgId = header("webhook-id") ?? header("svix-id");
  const msgTimestamp = header("webhook-timestamp") ?? header("svix-timestamp");
  const msgSignature = header("webhook-signature") ?? header("svix-signature");

  if (!secret || !secret.startsWith("whsec_")) {
    throw new Error("Verification secret is missing or invalid");
  }
  if (!msgId || !msgTimestamp || !msgSignature) {
    throw new Error("Missing webhook ID, timestamp, or signature");
  }

  const base64Part = secret.slice("whsec_".length);
  const key = Buffer.from(base64Part, "base64");
  const payloadStr = payload ?? "";
  const toSign = `${msgId}.${msgTimestamp}.${payloadStr}`;
  const expectedSig = createHmac("sha256", key).update(toSign).digest("base64");

  const passedSigs = msgSignature.split(" ");
  for (const versionedSig of passedSigs) {
    const [version, signature] = versionedSig.split(",");
    if (version !== "v1" || !signature) continue;
    const sigBytes = Buffer.from(signature, "base64");
    const expectedSigBytes = Buffer.from(expectedSig, "base64");
    if (
      expectedSigBytes.length === sigBytes.length &&
      timingSafeEqual(expectedSigBytes, sigBytes)
    ) {
      return;
    }
  }

  throw new Error("No matching signature found");
}

/** Build Svix-style headers for fixture tests. */
export function signRecallWebhook(args: {
  secret: string;
  msgId: string;
  timestamp: string;
  payload: string;
}): string {
  const base64Part = args.secret.slice("whsec_".length);
  const key = Buffer.from(base64Part, "base64");
  const toSign = `${args.msgId}.${args.timestamp}.${args.payload}`;
  const sig = createHmac("sha256", key).update(toSign).digest("base64");
  return `v1,${sig}`;
}
