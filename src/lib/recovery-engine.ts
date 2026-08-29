import type {
  AuditEvent,
  PolicyDecision,
  RecoveryCase,
  RecoveryRecommendation,
} from "./recovery-types";

const actionByKind: Record<RecoveryCase["kind"], Omit<RecoveryRecommendation, "rationale" | "expectedOutcome">> = {
  payment_degradation: {
    action: "Issue a fresh, verified payment link",
    channel: "Payment link",
    copy: "Your last payment did not go through. Use this secure link to complete it when ready.",
  },
  checkout_dropoff: {
    action: "Send one checkout recovery message",
    channel: "Email",
    copy: "Your checkout is still saved. Complete your order securely using the link below.",
  },
  subscription_failure: {
    action: "Ask for payment-method update",
    channel: "Email",
    copy: "Your subscription renewal needs an updated payment method. Update it securely to keep your service active.",
  },
  b2b_receivable: {
    action: "Send an invoice-specific payment link",
    channel: "Payment link",
    copy: "Your invoice is now overdue. Please use the linked payment option or reply with a payment date.",
  },
  mandate_retry: {
    action: "Schedule the next permitted retry window",
    channel: "Mandate",
    copy: "We will retry only during the next provider-approved window. No duplicate debit will be initiated.",
  },
  hinglish_voice: {
    action: "Offer a consent-safe Hinglish callback",
    channel: "Voice",
    copy: "Namaste, aapka payment pending hai. Kya main aapko secure payment link bhej doon?",
  },
  promise_to_pay: {
    action: "Confirm the promise and pause chasing",
    channel: "SMS",
    copy: "Thanks for confirming. We have noted your payment promise and will not send further reminders before the due date.",
  },
};

export function evaluatePolicy(recoveryCase: RecoveryCase): PolicyDecision {
  if (recoveryCase.status === "recovered") {
    return {
      allowed: false,
      title: "Recovery already confirmed",
      detail: "This receivable has a confirmed recovery event, so all follow-ups are stopped.",
      nextStep: "Close the case and preserve the audit evidence.",
    };
  }

  if (recoveryCase.optedOut) {
    return {
      allowed: false,
      title: "Customer opted out",
      detail: "The contact preference blocks all automated outreach.",
      nextStep: "Route to a human queue only if there is a lawful, approved exception.",
    };
  }

  if (!recoveryCase.consent) {
    return {
      allowed: false,
      title: "No valid outreach consent",
      detail: "The action cannot be sent until a valid contact preference is present.",
      nextStep: "Keep the case visible but do not contact the customer.",
    };
  }

  if (recoveryCase.promiseDue) {
    return {
      allowed: false,
      title: "Promise-to-pay is active",
      detail: `The customer promised payment by ${recoveryCase.promiseDue}; the collection sequence is paused.`,
      nextStep: "Resume only after the promise expires without a confirmed payment.",
    };
  }

  if (recoveryCase.contactsPastWeek >= 3) {
    return {
      allowed: false,
      title: "Contact cap reached",
      detail: "Three automated contact attempts have already been made in the last seven days.",
      nextStep: "Wait for the cap window to reset or route to a human reviewer.",
    };
  }

  if (recoveryCase.isQuietHours) {
    return {
      allowed: false,
      title: "Quiet hours are active",
      detail: "The selected channel cannot be used during the configured customer quiet hours.",
      nextStep: "Queue the approved action for the next permitted window.",
    };
  }

  return {
    allowed: true,
    title: "Action is within recovery policy",
    detail: "Consent, contact limits, payment state, and stop conditions all pass.",
    nextStep: "A reviewer may approve the bounded action below.",
  };
}

export function getRecommendation(recoveryCase: RecoveryCase): RecoveryRecommendation {
  const recommendation = actionByKind[recoveryCase.kind];
  const isHighValue = recoveryCase.amountAtRisk >= 20000;

  return {
    ...recommendation,
    rationale: `${recoveryCase.rootCause}. ${isHighValue ? "The value is high enough to prioritize a supervised, immediate recovery path." : "A low-friction, single-channel recovery path is preferred."}`,
    expectedOutcome:
      recoveryCase.simulationOutcome === "recovered"
        ? "Demo outcome: captured payment and recovery attribution."
        : recoveryCase.simulationOutcome === "promise"
          ? "Demo outcome: recorded promise-to-pay and paused chasing."
          : "Demo outcome: case remains open while awaiting provider or customer action.",
  };
}

export function getInitialAudit(recoveryCase: RecoveryCase): AuditEvent[] {
  const recommendation = getRecommendation(recoveryCase);
  const policy = evaluatePolicy(recoveryCase);
  return [
    {
      id: `${recoveryCase.id}-signal`,
      caseId: recoveryCase.id,
      time: "Today, 10:14",
      title: "Risk signal ingested",
      detail: recoveryCase.lastSignal,
      type: "signal",
    },
    {
      id: `${recoveryCase.id}-ai`,
      caseId: recoveryCase.id,
      time: "Today, 10:15",
      title: "AI diagnosis completed",
      detail: recommendation.rationale,
      type: "ai",
    },
    {
      id: `${recoveryCase.id}-policy`,
      caseId: recoveryCase.id,
      time: "Today, 10:15",
      title: policy.title,
      detail: policy.detail,
      type: "policy",
    },
  ];
}

export function executeDemoAction(recoveryCase: RecoveryCase): {
  updatedCase: RecoveryCase;
  auditEvents: AuditEvent[];
} {
  const recommendation = getRecommendation(recoveryCase);

  const actionEvent: AuditEvent = {
    id: `${recoveryCase.id}-action-${Date.now()}`,
    caseId: recoveryCase.id,
    time: "Just now",
    title: "Bounded recovery action executed",
    detail: `${recommendation.action} through the ${recommendation.channel} adapter.`,
    type: "action",
  };

  if (recoveryCase.simulationOutcome === "recovered") {
    return {
      updatedCase: {
        ...recoveryCase,
        status: "recovered",
        amountRecovered: recoveryCase.amountAtRisk,
        latestAction: recommendation.action,
      },
      auditEvents: [
        actionEvent,
        {
          id: `${recoveryCase.id}-recovered-${Date.now()}`,
          caseId: recoveryCase.id,
          time: "Just now",
          title: "Payment captured and attributed",
          detail: `INR ${formatCurrency(recoveryCase.amountAtRisk)} is counted once against ${recoveryCase.id}.`,
          type: "recovery",
        },
      ],
    };
  }

  if (recoveryCase.simulationOutcome === "promise") {
    return {
      updatedCase: {
        ...recoveryCase,
        status: "promise_to_pay",
        promiseDue: "30 Aug, 5:00 PM",
        latestAction: recommendation.action,
      },
      auditEvents: [
        actionEvent,
        {
          id: `${recoveryCase.id}-promise-${Date.now()}`,
          caseId: recoveryCase.id,
          time: "Just now",
          title: "Promise-to-pay recorded",
          detail: "All automated chasing has been paused until the promised payment date.",
          type: "policy",
        },
      ],
    };
  }

  return {
    updatedCase: {
      ...recoveryCase,
      status: "in_progress",
      latestAction: recommendation.action,
    },
    auditEvents: [
      actionEvent,
      {
        id: `${recoveryCase.id}-awaiting-${Date.now()}`,
        caseId: recoveryCase.id,
        time: "Just now",
        title: "Awaiting external confirmation",
        detail: "The case remains open. No additional action will run until a new signal or permitted window arrives.",
        type: "policy",
      },
    ],
  };
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
}
