import { getInitialAudit } from "./recovery-engine";
import type { AuditEvent, RecoveryCase, RecoveryKind } from "./recovery-types";

type Template = Omit<RecoveryCase, "id" | "customer" | "customerInitials" | "amountAtRisk" | "amountRecovered" | "riskScore" | "confidence" | "status">;

const templates: Template[] = [
  {
    kind: "payment_degradation", segment: "D2C · High value", currency: "INR",
    rootCause: "Bank decline rate increased for a saved card cohort",
    lastSignal: "Payment authorization failed twice after a gateway latency spike.",
    channel: "Payment link", consent: true, optedOut: false, contactsPastWeek: 0, promiseDue: null, isQuietHours: false, simulationOutcome: "recovered",
  },
  {
    kind: "checkout_dropoff", segment: "D2C · Cart recovery", currency: "INR",
    rootCause: "Checkout was abandoned after UPI intent returned without payment capture",
    lastSignal: "Checkout idle for 24 minutes; payment attempt has not been captured.",
    channel: "Email", consent: true, optedOut: false, contactsPastWeek: 1, promiseDue: null, isQuietHours: false, simulationOutcome: "recovered",
  },
  {
    kind: "subscription_failure", segment: "SaaS · Monthly plan", currency: "INR",
    rootCause: "Recurring subscription is pending after an auto-charge failure",
    lastSignal: "subscription.pending received; provider retry is due tomorrow.",
    channel: "Email", consent: true, optedOut: false, contactsPastWeek: 0, promiseDue: null, isQuietHours: false, simulationOutcome: "awaiting",
  },
  {
    kind: "b2b_receivable", segment: "B2B · Enterprise invoice", currency: "INR",
    rootCause: "Invoice is 14 days overdue with no dispute or partial payment",
    lastSignal: "Invoice INV-842 is overdue; last reminder was acknowledged.",
    channel: "Payment link", consent: true, optedOut: false, contactsPastWeek: 2, promiseDue: null, isQuietHours: false, simulationOutcome: "promise",
  },
  {
    kind: "mandate_retry", segment: "Subscription · Mandate", currency: "INR",
    rootCause: "Mandate charge failed for insufficient balance",
    lastSignal: "Provider retry model permits a next retry window tomorrow at 11:00 AM.",
    channel: "Mandate", consent: true, optedOut: false, contactsPastWeek: 1, promiseDue: null, isQuietHours: false, simulationOutcome: "awaiting",
  },
  {
    kind: "hinglish_voice", segment: "D2C · Assisted recovery", currency: "INR",
    rootCause: "High-value payment link expired after two unread reminders",
    lastSignal: "Customer has consented to a phone callback and prefers Hinglish support.",
    channel: "Voice", consent: true, optedOut: false, contactsPastWeek: 1, promiseDue: null, isQuietHours: false, simulationOutcome: "promise",
  },
  {
    kind: "promise_to_pay", segment: "B2B · Follow-up", currency: "INR",
    rootCause: "A previously recorded payment promise is nearing its due date",
    lastSignal: "Promise recorded for INR 18,400; no captured payment yet.",
    channel: "SMS", consent: true, optedOut: false, contactsPastWeek: 0, promiseDue: "30 Aug, 5:00 PM", isQuietHours: false, simulationOutcome: "awaiting",
  },
];

const people = [
  ["Ananya Rao", "AR"], ["Rohan Mehta", "RM"], ["Kavya Iyer", "KI"], ["Aarav Sharma", "AS"],
  ["Nisha Kapoor", "NK"], ["Vikram Nair", "VN"], ["Ishita Sen", "IS"], ["Rahul Verma", "RV"],
  ["Meera Joshi", "MJ"], ["Dev Malhotra", "DM"], ["Priya Menon", "PM"], ["Kunal Shah", "KS"],
] as const;

export const kindLabels: Record<RecoveryKind, string> = {
  payment_degradation: "Payment degradation", checkout_dropoff: "Checkout drop-off", subscription_failure: "Subscription recovery",
  b2b_receivable: "B2B receivable", mandate_retry: "Mandate retry", hinglish_voice: "Hinglish voice", promise_to_pay: "Promise-to-pay",
};

export const kindShortLabels: Record<RecoveryKind, string> = {
  payment_degradation: "Payment", checkout_dropoff: "Checkout", subscription_failure: "Subscription",
  b2b_receivable: "B2B", mandate_retry: "Mandate", hinglish_voice: "Voice", promise_to_pay: "Promise",
};

export function createSeedCases(): RecoveryCase[] {
  return Array.from({ length: 120 }, (_, index) => {
    const template = templates[index % templates.length];
    const [customer, customerInitials] = people[index % people.length];
    const amountAtRisk = 2600 + ((index * 3871) % 38000);
    const alreadyRecovered = index % 5 === 0;
    const hasContactCap = index % 31 === 0;
    return {
      ...template,
      id: `REC-${2401 + index}`,
      customer,
      customerInitials,
      amountAtRisk,
      amountRecovered: alreadyRecovered ? amountAtRisk : 0,
      riskScore: 54 + ((index * 13) % 45),
      confidence: 73 + ((index * 7) % 25),
      status: (alreadyRecovered ? "recovered" : template.promiseDue ? "promise_to_pay" : "at_risk") as RecoveryCase["status"],
      contactsPastWeek: hasContactCap ? 3 : template.contactsPastWeek,
      optedOut: index === 39,
      consent: index === 72 ? false : template.consent,
      isQuietHours: index === 94,
    };
  }).sort((a, b) => b.riskScore - a.riskScore);
}

export function createSeedAudit(cases: RecoveryCase[]): Record<string, AuditEvent[]> {
  return Object.fromEntries(cases.map((recoveryCase) => [recoveryCase.id, getInitialAudit(recoveryCase)]));
}

export const recoveryTrend = [
  { label: "Mon", recovered: 18 }, { label: "Tue", recovered: 26 }, { label: "Wed", recovered: 31 },
  { label: "Thu", recovered: 42 }, { label: "Fri", recovered: 51 }, { label: "Sat", recovered: 48 }, { label: "Sun", recovered: 67 },
];
