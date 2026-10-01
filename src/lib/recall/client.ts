import {
  getRecallConfig,
  recallApiBase,
  type RecallConfig,
} from "./config";

export class RecallApiError extends Error {
  status: number;
  body: unknown;
  retryAfterSec: number | null;

  constructor(
    message: string,
    status: number,
    body: unknown,
    retryAfterSec: number | null = null,
  ) {
    super(message);
    this.name = "RecallApiError";
    this.status = status;
    this.body = body;
    this.retryAfterSec = retryAfterSec;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const asNum = Number(header);
  if (Number.isFinite(asNum) && asNum >= 0) return asNum;
  const when = Date.parse(header);
  if (!Number.isNaN(when)) {
    return Math.max(0, (when - Date.now()) / 1000);
  }
  return null;
}

export type CreateBotInput = {
  meetingUrl: string;
  botName?: string;
  joinAt?: string | null;
  metadata?: Record<string, string>;
};

export type RecallBot = {
  id: string;
  meeting_url?: unknown;
  bot_name?: string;
  join_at?: string | null;
  status_changes?: Array<{ code?: string; created_at?: string }>;
  recordings?: Array<{ id: string; media_shortcuts?: unknown }>;
  metadata?: Record<string, unknown>;
};

export type CalendarEvent = {
  id: string;
  start_time: string;
  end_time: string;
  calendar_id: string;
  meeting_url: string | null;
  is_deleted: boolean;
  updated_at: string;
  platform?: string;
  raw?: unknown;
  bots?: Array<{
    bot_id: string;
    start_time?: string;
    meeting_url?: string;
    deduplication_key?: string;
  }>;
};

export class RecallClient {
  private readonly config: RecallConfig;

  constructor(config?: RecallConfig) {
    this.config = config ?? getRecallConfig();
  }

  get publicBaseUrl(): string {
    return this.config.publicApiBaseUrl;
  }

  get botName(): string {
    return this.config.botName;
  }

  get region(): string {
    return this.config.region;
  }

  private url(path: string): string {
    return `${recallApiBase(this.config.region)}${path}`;
  }

  async request<T>(
    method: string,
    path: string,
    body?: unknown,
    opts?: { maxAttempts?: number },
  ): Promise<T> {
    const maxAttempts = opts?.maxAttempts ?? 4;
    let attempt = 0;
    let lastError: unknown;

    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        const res = await fetch(this.url(path), {
          method,
          headers: {
            Authorization: `Token ${this.config.apiKey}`,
            Accept: "application/json",
            ...(body !== undefined
              ? { "Content-Type": "application/json" }
              : {}),
          },
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });

        const retryAfter = parseRetryAfter(res.headers.get("retry-after"));
        const text = await res.text();
        let parsed: unknown = null;
        if (text) {
          try {
            parsed = JSON.parse(text);
          } catch {
            parsed = text;
          }
        }

        if (res.status === 429 || res.status === 503 || res.status === 507) {
          const waitSec =
            retryAfter ?? Math.min(30, 0.5 * 2 ** (attempt - 1) + Math.random());
          if (attempt >= maxAttempts) {
            throw new RecallApiError(
              `Recall API ${method} ${path} failed with ${res.status}`,
              res.status,
              parsed,
              retryAfter,
            );
          }
          await sleep(waitSec * 1000);
          continue;
        }

        if (!res.ok) {
          throw new RecallApiError(
            `Recall API ${method} ${path} failed with ${res.status}`,
            res.status,
            parsed,
            retryAfter,
          );
        }

        return (parsed ?? {}) as T;
      } catch (err) {
        lastError = err;
        if (err instanceof RecallApiError) throw err;
        if (attempt >= maxAttempts) break;
        await sleep(Math.min(30, 0.5 * 2 ** (attempt - 1)) * 1000);
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("Recall API request failed");
  }

  createBot(input: CreateBotInput): Promise<RecallBot> {
    return this.request<RecallBot>("POST", "/api/v1/bot/", {
      meeting_url: input.meetingUrl,
      bot_name: input.botName ?? this.config.botName,
      ...(input.joinAt ? { join_at: input.joinAt } : {}),
      metadata: {
        source: "brief",
        ...input.metadata,
      },
      recording_config: {},
    });
  }

  getBot(botId: string): Promise<RecallBot> {
    return this.request<RecallBot>("GET", `/api/v1/bot/${botId}/`);
  }

  createAsyncTranscript(recordingId: string): Promise<{ id: string }> {
    return this.request<{ id: string }>(
      "POST",
      `/api/v1/recording/${recordingId}/create_transcript/`,
      {
        provider: {
          recallai_async: {
            language_code: "auto",
          },
        },
        diarization: {
          use_separate_streams_when_available: true,
        },
      },
    );
  }

  getTranscript(transcriptId: string): Promise<{
    id: string;
    data?: { download_url?: string };
  }> {
    return this.request("GET", `/api/v1/transcript/${transcriptId}/`);
  }

  getRecording(recordingId: string): Promise<{
    id: string;
    media_shortcuts?: {
      transcript?: { id?: string; data?: { download_url?: string } };
    };
  }> {
    return this.request("GET", `/api/v1/recording/${recordingId}/`);
  }

  listCalendarEvents(params: {
    calendarId: string;
    updatedAtGte?: string;
    isDeleted?: boolean;
  }): Promise<{ next: string | null; results: CalendarEvent[] }> {
    const qs = new URLSearchParams({ calendar_id: params.calendarId });
    if (params.updatedAtGte) qs.set("updated_at__gte", params.updatedAtGte);
    if (params.isDeleted === false) qs.set("is_deleted", "false");
    return this.request(
      "GET",
      `/api/v2/calendar-events/?${qs.toString()}`,
    );
  }

  /** Follow a Recall-provided pagination URL without rewriting query params. */
  async followCalendarEventsNext(
    nextUrl: string,
  ): Promise<{ next: string | null; results: CalendarEvent[] }> {
    const maxAttempts = 4;
    let attempt = 0;
    while (attempt < maxAttempts) {
      attempt += 1;
      const res = await fetch(nextUrl, {
        headers: {
          Authorization: `Token ${this.config.apiKey}`,
          Accept: "application/json",
        },
      });
      const retryAfter = parseRetryAfter(res.headers.get("retry-after"));
      const text = await res.text();
      let parsed: unknown = null;
      if (text) {
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = text;
        }
      }
      if (res.status === 429 || res.status === 503 || res.status === 507) {
        const waitSec =
          retryAfter ?? Math.min(30, 0.5 * 2 ** (attempt - 1) + Math.random());
        if (attempt >= maxAttempts) {
          throw new RecallApiError(
            `Recall pagination failed with ${res.status}`,
            res.status,
            parsed,
            retryAfter,
          );
        }
        await sleep(waitSec * 1000);
        continue;
      }
      if (!res.ok) {
        throw new RecallApiError(
          `Recall pagination failed with ${res.status}`,
          res.status,
          parsed,
          retryAfter,
        );
      }
      return (parsed ?? { next: null, results: [] }) as {
        next: string | null;
        results: CalendarEvent[];
      };
    }
    throw new Error("Recall pagination failed");
  }

  scheduleBotForCalendarEvent(
    eventId: string,
    body: {
      deduplication_key: string;
      bot_config: Record<string, unknown>;
    },
  ): Promise<CalendarEvent> {
    return this.request(
      "POST",
      `/api/v2/calendar-events/${eventId}/bot/`,
      body,
    );
  }

  removeBotFromCalendarEvent(eventId: string): Promise<CalendarEvent> {
    return this.request(
      "DELETE",
      `/api/v2/calendar-events/${eventId}/bot/`,
    );
  }

  getCalendar(calendarId: string): Promise<{
    id: string;
    status?: string;
    platform?: string;
    platform_email?: string;
  }> {
    return this.request("GET", `/api/v2/calendars/${calendarId}/`);
  }
}

export async function downloadJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download artifact (${res.status})`);
  }
  return res.json();
}
