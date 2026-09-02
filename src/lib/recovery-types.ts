export const recoveryKinds = [
  "payment_degradation",
  "checkout_dropoff",
  "subscription_failure",
  "b2b_receivable",
  "mandate_retry",
  "hinglish_voice",
  "promise_to_pay",
] as const;

export type RecoveryKind = (typeof recoveryKinds)[number];

export type CaseStatus =
  | "at_risk"
  | "in_progress"
  | "promise_to_pay"
  | "recovered"
  | "blocked";

export type SimulationOutcome = "recovered" | "promise" | "awaiting";

export type AdapterMode = "live_test" | "simulated" | "fallback" | "blocked";

export type RecoveryCase = {
  id: string;
  kind: RecoveryKind;
  customer: string;
  customerInitials: string;
  segment: string;
  amountAtRisk: number;
  amountRecovered: number;
  currency: "INR";
  riskScore: number;
  confidence: number;
  status: CaseStatus;
  rootCause: string;
  lastSignal: string;
  channel: "Email" | "SMS" | "Voice" | "Payment link" | "Mandate";
  consent: boolean;
  optedOut: boolean;
  contactsPastWeek: number;
  promiseDue: string | null;
  isQuietHours: boolean;
  simulationOutcome: SimulationOutcome;
  latestAction?: string;
};

export type PolicyDecision = {
  allowed: boolean;
  title: string;
  detail: string;
  nextStep: string;
};

export type RecoveryRecommendation = {
  action: string;
  channel: string;
  copy: string;
  rationale: string;
  expectedOutcome: string;
};

export type AuditEvent = {
  id: string;
  caseId: string;
  time: string;
  title: string;
  detail: string;
  type: "signal" | "ai" | "policy" | "action" | "recovery";
  adapterMode?: AdapterMode;
};

export type Diagnosis = {
  rootCause: string;
  riskSummary: string;
  recommendedAction: string;
  recommendedChannel: RecoveryCase["channel"];
  customerSafeCopy: string;
  confidence: number;
  evidence: string[];
  humanReviewReason: string | null;
  mode: AdapterMode;
};

export type DemoRun = {
  id: string;
  expiresAt: string;
  mode: "supabase" | "fallback";
};

export type IntegrationHealth = {
  name: "Supabase" | "Gemini" | "Razorpay Test Mode" | "Resend";
  mode: AdapterMode;
  detail: string;
};
