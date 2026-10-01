/**
 * Server-only Recall.ai configuration.
 * Inject fake values in tests; never read credentials in client code.
 */

export type RecallConfig = {
  region: string;
  apiKey: string;
  webhookVerificationSecret: string;
  publicApiBaseUrl: string;
  botName: string;
  workspaceId: string;
};

export class RecallConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RecallConfigError";
  }
}

const WORKSPACE_ID = "f8d5b6da-b98e-456f-9df9-e07d8188196c";

function requireEnv(name: string, value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new RecallConfigError(`${name} is not configured`);
  }
  return trimmed;
}

export function getRecallConfig(
  env: NodeJS.ProcessEnv = process.env,
): RecallConfig {
  const region = requireEnv("RECALL_REGION", env.RECALL_REGION);
  const apiKey = requireEnv("RECALL_API_KEY", env.RECALL_API_KEY);
  const webhookVerificationSecret = requireEnv(
    "RECALL_WEBHOOK_VERIFICATION_SECRET",
    env.RECALL_WEBHOOK_VERIFICATION_SECRET,
  );
  const publicApiBaseUrl = requireEnv(
    "PUBLIC_API_BASE_URL",
    env.PUBLIC_API_BASE_URL,
  ).replace(/\/$/, "");
  const botName =
    env.RECALL_BOT_NAME?.trim() || "Brief Notetaker";

  if (!publicApiBaseUrl.startsWith("https://")) {
    throw new RecallConfigError(
      "PUBLIC_API_BASE_URL must be a stable HTTPS origin (not localhost)",
    );
  }
  try {
    const host = new URL(publicApiBaseUrl).hostname;
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.endsWith(".local")
    ) {
      throw new RecallConfigError(
        "PUBLIC_API_BASE_URL must not point at localhost",
      );
    }
  } catch (err) {
    if (err instanceof RecallConfigError) throw err;
    throw new RecallConfigError("PUBLIC_API_BASE_URL is not a valid URL");
  }

  if (!webhookVerificationSecret.startsWith("whsec_")) {
    throw new RecallConfigError(
      "RECALL_WEBHOOK_VERIFICATION_SECRET must start with whsec_",
    );
  }

  return {
    region,
    apiKey,
    webhookVerificationSecret,
    publicApiBaseUrl,
    botName,
    workspaceId: WORKSPACE_ID,
  };
}

export function recallApiBase(region: string): string {
  return `https://${region}.recall.ai`;
}

export function recallWebhookPath(): string {
  return "/api/webhooks/recall";
}

export function recallCalendarCallbackPath(): string {
  return "/api/recall/calendar/callback";
}
