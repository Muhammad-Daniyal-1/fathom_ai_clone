import type { Meeting, Participant } from "./types";

export const participants: Record<string, Participant> = {
  daniyal: {
    id: "daniyal",
    name: "HM Daniyal",
    initials: "D",
    role: "Engineering",
  },
  muneeb: {
    id: "muneeb",
    name: "Muneeb Warsi",
    initials: "MW",
    role: "Stakeholder",
  },
  sara: {
    id: "sara",
    name: "Sara Khan",
    initials: "SK",
    role: "Backend",
  },
  alex: {
    id: "alex",
    name: "Alex Rivera",
    initials: "AR",
    role: "Product",
  },
};

/** Audio asset is ~34.5s — timestamps stay inside that window for real sync. */
export const meetings: Meeting[] = [
  {
    id: "atlas-weekly",
    title: "Atlas Dashboard Weekly Sync",
    dateISO: "2026-09-30",
    dateLabel: "Yesterday",
    groupLabel: "Yesterday",
    durationSec: 35,
    description:
      "Aligned on Atlas stack and launch risk: Postgres replaces MongoDB, dashboard due Friday, API credentials tomorrow 5pm, beta launch moved Oct 15 → Oct 22.",
    audioSrc: "/audio/atlas-weekly.wav",
    waveformHue: 18,
    participantIds: ["daniyal", "muneeb", "sara"],
    transcript: [
      {
        id: "aw-u1",
        speakerId: "daniyal",
        startTime: 0,
        endTime: 2.4,
        text: "Hi Muneeb, how are you?",
      },
      {
        id: "aw-u2",
        speakerId: "muneeb",
        startTime: 2.4,
        endTime: 4.2,
        text: "Hi, I am good.",
      },
      {
        id: "aw-u3",
        speakerId: "daniyal",
        startTime: 4.2,
        endTime: 9.5,
        text: "Today we need to align on Atlas dashboard updates and launch risks before we go too far.",
      },
      {
        id: "aw-u4",
        speakerId: "daniyal",
        startTime: 9.5,
        endTime: 14.2,
        text: "Important decision: we will use Postgres instead of MongoDB for the project.",
      },
      {
        id: "aw-u5",
        speakerId: "daniyal",
        startTime: 14.2,
        endTime: 18.0,
        text: "I will finish the analytics dashboard by Friday.",
      },
      {
        id: "aw-u6",
        speakerId: "daniyal",
        startTime: 18.0,
        endTime: 22.0,
        text: "Sara needs to send API credentials tomorrow by 5 PM.",
      },
      {
        id: "aw-u7",
        speakerId: "daniyal",
        startTime: 22.0,
        endTime: 25.5,
        text: "Payment integration could delay the launch if we are not careful.",
      },
      {
        id: "aw-u8",
        speakerId: "daniyal",
        startTime: 25.5,
        endTime: 29.2,
        text: "We still have not decided which payment provider to use — Stripe or Braintree are both on the table.",
      },
      {
        id: "aw-u9",
        speakerId: "daniyal",
        startTime: 29.2,
        endTime: 33.0,
        text: "To reduce risk, we are moving the beta launch from October 15 to October 22.",
      },
      {
        id: "aw-u10",
        speakerId: "muneeb",
        startTime: 33.0,
        endTime: 34.5,
        text: "Okay — thanks. Some of the technical detail is still hard for me to follow, but the dates are clear.",
      },
    ],
    summary: {
      templateName: "Enhanced Summary",
      purpose:
        "To align on Atlas dashboard project updates and address launch risks.",
      takeaways: [
        {
          id: "aw-t1",
          label: "Launch Delayed",
          text: "Beta launch moved from Oct 15 → Oct 22 to mitigate payment integration uncertainty.",
          evidenceUtteranceId: "aw-u9",
        },
        {
          id: "aw-t2",
          label: "Tech Stack Change",
          text: "Project will now use Postgres instead of MongoDB.",
          evidenceUtteranceId: "aw-u4",
        },
        {
          id: "aw-t3",
          label: "Commitments",
          text: "Daniyal finishes analytics dashboard by Friday; Sara sends API credentials by tomorrow, 5 PM.",
          evidenceUtteranceId: "aw-u5",
        },
      ],
      topics: [
        {
          id: "aw-topic-1",
          title: "Launch Risk & Mitigation",
          bullets: [
            {
              text: "Problem: payment integration may delay launch.",
              evidenceUtteranceId: "aw-u7",
            },
            {
              text: "Root cause: payment provider not selected.",
              evidenceUtteranceId: "aw-u8",
            },
            {
              text: "Solution: new launch date October 22.",
              evidenceUtteranceId: "aw-u9",
            },
          ],
        },
        {
          id: "aw-topic-2",
          title: "Project Updates & Dependencies",
          bullets: [
            {
              text: "Stack: Postgres selected over MongoDB.",
              evidenceUtteranceId: "aw-u4",
            },
            {
              text: "Analytics dashboard due Friday (Daniyal).",
              evidenceUtteranceId: "aw-u5",
            },
            {
              text: "API credentials due tomorrow 5 PM (Sara).",
              evidenceUtteranceId: "aw-u6",
            },
          ],
        },
      ],
      nextSteps: [
        {
          id: "aw-ns1",
          label: "Sara",
          text: "Send API credentials by tomorrow, 5 PM.",
          evidenceUtteranceId: "aw-u6",
        },
        {
          id: "aw-ns2",
          label: "Daniyal",
          text: "Complete analytics dashboard by Friday.",
          evidenceUtteranceId: "aw-u5",
        },
        {
          id: "aw-ns3",
          label: "Team",
          text: "Select a payment provider (e.g. Stripe, Braintree).",
          evidenceUtteranceId: "aw-u8",
        },
        {
          id: "aw-ns4",
          label: "Team",
          text: "Prepare for beta launch on October 22.",
          evidenceUtteranceId: "aw-u9",
        },
      ],
    },
    outcomes: [
      {
        id: "aw-o1",
        type: "decision",
        title: "Use PostgreSQL",
        description: "Use PostgreSQL/Postgres instead of MongoDB for Atlas.",
        evidenceUtteranceId: "aw-u4",
      },
      {
        id: "aw-o2",
        type: "commitment",
        title: "Finish analytics dashboard",
        description: "Complete the Atlas analytics dashboard.",
        ownerId: "daniyal",
        dueLabel: "Friday",
        status: "open",
        evidenceUtteranceId: "aw-u5",
      },
      {
        id: "aw-o3",
        type: "commitment",
        title: "Send API credentials",
        description: "Send API credentials to the team.",
        ownerId: "sara",
        dueLabel: "Tomorrow · 5 PM",
        status: "open",
        evidenceUtteranceId: "aw-u6",
      },
      {
        id: "aw-o4",
        type: "risk",
        title: "Payment integration delay",
        description: "Payment integration could delay the launch.",
        evidenceUtteranceId: "aw-u7",
      },
      {
        id: "aw-o5",
        type: "decision_change",
        title: "Beta launch date",
        description: "Beta launch date moved to reduce payment risk.",
        previousValue: "October 15",
        newValue: "October 22",
        evidenceUtteranceId: "aw-u9",
      },
      {
        id: "aw-o6",
        type: "open_question",
        title: "Payment provider",
        description: "Which payment provider should the team use?",
        evidenceUtteranceId: "aw-u8",
      },
    ],
    actionItems: [
      {
        id: "aw-a1",
        text: "Finish analytics dashboard",
        ownerId: "daniyal",
        dueLabel: "Friday",
        status: "open",
        outcomeId: "aw-o2",
        evidenceUtteranceId: "aw-u5",
      },
      {
        id: "aw-a2",
        text: "Send API credentials",
        ownerId: "sara",
        dueLabel: "Tomorrow · 5 PM",
        status: "open",
        outcomeId: "aw-o3",
        evidenceUtteranceId: "aw-u6",
      },
      {
        id: "aw-a3",
        text: "Select a payment provider",
        ownerId: "daniyal",
        dueLabel: "Before Oct 22",
        status: "open",
        outcomeId: "aw-o6",
        evidenceUtteranceId: "aw-u8",
      },
    ],
    askSuggestions: [
      {
        id: "aw-ask1",
        prompt: "What did we decide?",
        answer:
          "The team decided to use Postgres instead of MongoDB, and moved the beta launch from October 15 to October 22 to reduce payment risk.",
        evidenceUtteranceIds: ["aw-u4", "aw-u9"],
      },
      {
        id: "aw-ask2",
        prompt: "What are the biggest risks?",
        answer:
          "Payment integration is the main launch risk, driven by the still-unresolved payment provider choice.",
        evidenceUtteranceIds: ["aw-u7", "aw-u8"],
      },
      {
        id: "aw-ask3",
        prompt: "What should I follow up on?",
        answer:
          "Follow up on Daniyal’s analytics dashboard (due Friday) and Sara’s API credentials (due tomorrow 5 PM). The payment provider decision is still open.",
        evidenceUtteranceIds: ["aw-u5", "aw-u6", "aw-u8"],
      },
    ],
  },
  {
    id: "payment-review",
    title: "Payment Integration Review",
    dateISO: "2026-10-01",
    dateLabel: "Today",
    groupLabel: "Today",
    durationSec: 35,
    description:
      "Stripe selected; API credentials received; sandbox underway. Webhook reliability remains the open blocker.",
    audioSrc: "/audio/payment-review.wav",
    waveformHue: 210,
    participantIds: ["daniyal", "sara", "alex"],
    transcript: [
      {
        id: "pr-u1",
        speakerId: "alex",
        startTime: 0,
        endTime: 4,
        text: "Quick sync on payments — did we land a provider?",
      },
      {
        id: "pr-u2",
        speakerId: "sara",
        startTime: 4,
        endTime: 9,
        text: "Yes. Decision: we selected Stripe. Credentials were sent this morning.",
      },
      {
        id: "pr-u3",
        speakerId: "daniyal",
        startTime: 9,
        endTime: 15,
        text: "Sandbox integration is underway. Commitment: I will wire the checkout flow by Thursday.",
      },
      {
        id: "pr-u4",
        speakerId: "sara",
        startTime: 15,
        endTime: 22,
        text: "Risk: webhook delivery is flaky in sandbox — that could block launch readiness.",
      },
      {
        id: "pr-u5",
        speakerId: "alex",
        startTime: 22,
        endTime: 28,
        text: "Open question: do we need a retry queue before beta, or can we ship with manual reconciliation?",
      },
      {
        id: "pr-u6",
        speakerId: "daniyal",
        startTime: 28,
        endTime: 34,
        text: "Let's keep the Oct 22 launch, but treat webhooks as the critical path.",
      },
    ],
    summary: {
      templateName: "Enhanced Summary",
      purpose: "Confirm payment provider and unblock sandbox integration.",
      takeaways: [
        {
          id: "pr-t1",
          label: "Provider Selected",
          text: "Stripe chosen; API credentials received.",
          evidenceUtteranceId: "pr-u2",
        },
        {
          id: "pr-t2",
          label: "Open Risk",
          text: "Webhook reliability in sandbox remains a blocker risk.",
          evidenceUtteranceId: "pr-u4",
        },
      ],
      topics: [
        {
          id: "pr-topic-1",
          title: "Integration Status",
          bullets: [
            {
              text: "Sandbox checkout wiring targeted for Thursday.",
              evidenceUtteranceId: "pr-u3",
            },
            {
              text: "Webhook retry strategy still undecided.",
              evidenceUtteranceId: "pr-u5",
            },
          ],
        },
      ],
      nextSteps: [
        {
          id: "pr-ns1",
          label: "Daniyal",
          text: "Wire Stripe checkout in sandbox by Thursday.",
          evidenceUtteranceId: "pr-u3",
        },
        {
          id: "pr-ns2",
          label: "Sara",
          text: "Reproduce and document webhook failures.",
          evidenceUtteranceId: "pr-u4",
        },
      ],
    },
    outcomes: [
      {
        id: "pr-o1",
        type: "decision",
        title: "Select Stripe",
        description: "Stripe selected as the payment provider.",
        evidenceUtteranceId: "pr-u2",
      },
      {
        id: "pr-o2",
        type: "commitment",
        title: "Wire checkout flow",
        description: "Complete sandbox Stripe checkout wiring.",
        ownerId: "daniyal",
        dueLabel: "Thursday",
        status: "open",
        evidenceUtteranceId: "pr-u3",
      },
      {
        id: "pr-o3",
        type: "risk",
        title: "Webhook flakiness",
        description: "Sandbox webhook delivery is unreliable.",
        evidenceUtteranceId: "pr-u4",
      },
      {
        id: "pr-o4",
        type: "open_question",
        title: "Retry queue before beta?",
        description:
          "Do we need a webhook retry queue before beta, or ship with manual reconciliation?",
        evidenceUtteranceId: "pr-u5",
      },
      {
        id: "pr-o5",
        type: "decision_change",
        title: "Prior payment provider undecided → Stripe",
        description:
          "Resolves the open provider question from the Atlas weekly sync.",
        previousValue: "Undecided",
        newValue: "Stripe",
        evidenceUtteranceId: "pr-u2",
      },
    ],
    actionItems: [
      {
        id: "pr-a1",
        text: "Wire Stripe checkout in sandbox",
        ownerId: "daniyal",
        dueLabel: "Thursday",
        status: "open",
        outcomeId: "pr-o2",
        evidenceUtteranceId: "pr-u3",
      },
      {
        id: "pr-a2",
        text: "Document webhook failure cases",
        ownerId: "sara",
        dueLabel: "This week",
        status: "open",
        outcomeId: "pr-o3",
        evidenceUtteranceId: "pr-u4",
      },
    ],
    askSuggestions: [
      {
        id: "pr-ask1",
        prompt: "What changed?",
        answer:
          "The payment provider is no longer open — Stripe was selected and credentials were received.",
        evidenceUtteranceIds: ["pr-u2"],
      },
      {
        id: "pr-ask2",
        prompt: "What needs my attention?",
        answer:
          "Webhook flakiness is the critical-path risk before the Oct 22 launch.",
        evidenceUtteranceIds: ["pr-u4", "pr-u6"],
      },
      {
        id: "pr-ask3",
        prompt: "What did we decide?",
        answer: "Stripe is the payment provider. Launch date remains October 22.",
        evidenceUtteranceIds: ["pr-u2", "pr-u6"],
      },
    ],
  },
  {
    id: "beta-readiness",
    title: "Beta Launch Readiness",
    dateISO: "2026-10-02",
    dateLabel: "Tomorrow",
    groupLabel: "Upcoming",
    durationSec: 35,
    description:
      "Analytics dashboard complete; payment testing in progress. One remaining blocker: webhook retries before Oct 22.",
    audioSrc: "/audio/beta-readiness.wav",
    waveformHue: 150,
    participantIds: ["daniyal", "sara", "alex", "muneeb"],
    transcript: [
      {
        id: "br-u1",
        speakerId: "alex",
        startTime: 0,
        endTime: 5,
        text: "Readiness check for October 22. Daniyal — dashboard status?",
      },
      {
        id: "br-u2",
        speakerId: "daniyal",
        startTime: 5,
        endTime: 11,
        text: "Decision update: the analytics dashboard is complete and merged. That commitment is done.",
      },
      {
        id: "br-u3",
        speakerId: "sara",
        startTime: 11,
        endTime: 18,
        text: "Payment integration testing is underway. Commitment: I will ship a minimal webhook retry by Monday.",
      },
      {
        id: "br-u4",
        speakerId: "muneeb",
        startTime: 18,
        endTime: 24,
        text: "From a stakeholder view, what's the one thing that could still slip the launch?",
      },
      {
        id: "br-u5",
        speakerId: "alex",
        startTime: 24,
        endTime: 30,
        text: "Risk: if retries aren't live, we keep a launch blocker. Open question: do we soft-launch without automatic retries?",
      },
      {
        id: "br-u6",
        speakerId: "daniyal",
        startTime: 30,
        endTime: 34.5,
        text: "Recommendation: keep Oct 22, but treat webhook retries as must-have.",
      },
    ],
    summary: {
      templateName: "Enhanced Summary",
      purpose: "Confirm beta readiness and remaining blockers before October 22.",
      takeaways: [
        {
          id: "br-t1",
          label: "Dashboard Done",
          text: "Analytics dashboard commitment completed.",
          evidenceUtteranceId: "br-u2",
        },
        {
          id: "br-t2",
          label: "Remaining Blocker",
          text: "Webhook retries are the last critical launch risk.",
          evidenceUtteranceId: "br-u5",
        },
      ],
      topics: [
        {
          id: "br-topic-1",
          title: "Launch Path",
          bullets: [
            {
              text: "Payment testing in progress; retries due Monday.",
              evidenceUtteranceId: "br-u3",
            },
            {
              text: "Soft-launch without retries still unresolved.",
              evidenceUtteranceId: "br-u5",
            },
          ],
        },
      ],
      nextSteps: [
        {
          id: "br-ns1",
          label: "Sara",
          text: "Ship minimal webhook retry by Monday.",
          evidenceUtteranceId: "br-u3",
        },
        {
          id: "br-ns2",
          label: "Team",
          text: "Confirm must-have vs soft-launch criteria.",
          evidenceUtteranceId: "br-u5",
        },
      ],
    },
    outcomes: [
      {
        id: "br-o1",
        type: "commitment",
        title: "Analytics dashboard",
        description: "Analytics dashboard completed and merged.",
        ownerId: "daniyal",
        dueLabel: "Friday",
        status: "done",
        evidenceUtteranceId: "br-u2",
      },
      {
        id: "br-o2",
        type: "commitment",
        title: "Webhook retry",
        description: "Ship a minimal webhook retry path.",
        ownerId: "sara",
        dueLabel: "Monday",
        status: "open",
        evidenceUtteranceId: "br-u3",
      },
      {
        id: "br-o3",
        type: "risk",
        title: "Launch blocker without retries",
        description: "Missing webhook retries remains a launch blocker.",
        evidenceUtteranceId: "br-u5",
      },
      {
        id: "br-o4",
        type: "open_question",
        title: "Soft-launch without retries?",
        description:
          "Can we soft-launch without automatic webhook retries?",
        evidenceUtteranceId: "br-u5",
      },
      {
        id: "br-o5",
        type: "decision",
        title: "Keep October 22",
        description: "Keep the October 22 beta date with retries as must-have.",
        evidenceUtteranceId: "br-u6",
      },
    ],
    actionItems: [
      {
        id: "br-a1",
        text: "Ship minimal webhook retry",
        ownerId: "sara",
        dueLabel: "Monday",
        status: "open",
        outcomeId: "br-o2",
        evidenceUtteranceId: "br-u3",
      },
      {
        id: "br-a2",
        text: "Confirm soft-launch criteria with stakeholders",
        ownerId: "alex",
        dueLabel: "This week",
        status: "open",
        outcomeId: "br-o4",
        evidenceUtteranceId: "br-u5",
      },
    ],
    askSuggestions: [
      {
        id: "br-ask1",
        prompt: "What needs my attention?",
        answer:
          "Sara’s webhook retry commitment (due Monday) is the remaining critical-path item before October 22.",
        evidenceUtteranceIds: ["br-u3", "br-u5"],
      },
      {
        id: "br-ask2",
        prompt: "What changed?",
        answer:
          "The analytics dashboard commitment is done. Payment work shifted from provider selection to webhook reliability.",
        evidenceUtteranceIds: ["br-u2"],
      },
      {
        id: "br-ask3",
        prompt: "What did we decide?",
        answer:
          "Keep the October 22 launch date, with webhook retries treated as must-have.",
        evidenceUtteranceIds: ["br-u6"],
      },
    ],
  },
];

export const globalAskSuggestions = [
  {
    id: "g1",
    prompt: "What did I commit to this week?",
    answer:
      "Open commitments: Daniyal — Atlas analytics dashboard (Friday) and Stripe checkout wiring (Thursday); Sara — API credentials (done in Payment Review) and webhook retry (Monday).",
  },
  {
    id: "g2",
    prompt: "What decisions changed?",
    answer:
      "Beta launch moved Oct 15 → Oct 22 in Atlas Weekly. Payment provider moved from undecided → Stripe in Payment Integration Review.",
  },
  {
    id: "g3",
    prompt: "What needs my attention?",
    answer:
      "Highest attention: webhook retry before Oct 22, plus Daniyal’s remaining checkout wiring. Dashboard work is complete.",
  },
];

export function getMeeting(id: string): Meeting | undefined {
  return meetings.find((m) => m.id === id);
}

export function getParticipant(id: string): Participant | undefined {
  return participants[id];
}

export function formatTimestamp(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function findUtteranceAtTime(
  meeting: Meeting,
  time: number,
): Meeting["transcript"][number] | undefined {
  if (!meeting.transcript.length) return undefined;
  const hit = meeting.transcript.find(
    (u) => time >= u.startTime && time < u.endTime,
  );
  if (hit) return hit;
  if (time >= meeting.transcript[meeting.transcript.length - 1].startTime) {
    return meeting.transcript[meeting.transcript.length - 1];
  }
  return meeting.transcript[0];
}
