import { describe, expect, it } from "vitest";
import { createSeedCases } from "./recovery-data";
import { evaluatePolicy, executeDemoAction, getRecommendation } from "./recovery-engine";

describe("recovery policy engine", () => {
  const cases = createSeedCases();

  it("blocks automated outreach when a customer opted out", () => {
    const optedOut = cases.find((recoveryCase) => recoveryCase.optedOut);
    expect(optedOut).toBeDefined();
    expect(evaluatePolicy(optedOut!).allowed).toBe(false);
    expect(evaluatePolicy(optedOut!).title).toBe("Customer opted out");
  });

  it("stops outreach while a promise-to-pay is valid", () => {
    const promiseCase = cases.find((recoveryCase) => recoveryCase.promiseDue);
    expect(promiseCase).toBeDefined();
    expect(evaluatePolicy(promiseCase!).title).toBe("Promise-to-pay is active");
  });

  it("generates a traceable recovery outcome for a safe payment case", () => {
    const paymentCase = cases.find(
      (recoveryCase) => recoveryCase.kind === "payment_degradation" && recoveryCase.status === "at_risk",
    );
    expect(paymentCase).toBeDefined();
    expect(evaluatePolicy(paymentCase!).allowed).toBe(true);
    expect(getRecommendation(paymentCase!).channel).toBe("Payment link");

    const result = executeDemoAction(paymentCase!);
    expect(result.updatedCase.status).toBe("recovered");
    expect(result.updatedCase.amountRecovered).toBe(paymentCase!.amountAtRisk);
    expect(result.auditEvents.some((event) => event.type === "recovery")).toBe(true);
  });
});
