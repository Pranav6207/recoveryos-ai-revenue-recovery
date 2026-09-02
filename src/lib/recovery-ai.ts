import "server-only";

import { z } from "zod";

import { getRecommendation } from "./recovery-engine";
import type { Diagnosis, RecoveryCase } from "./recovery-types";

const diagnosisSchema = z.object({
  rootCause: z.string().min(8).max(500),
  riskSummary: z.string().min(8).max(500),
  recommendedAction: z.string().min(3).max(300),
  recommendedChannel: z.enum(["Email", "SMS", "Voice", "Payment link", "Mandate"]),
  customerSafeCopy: z.string().min(3).max(1000),
  confidence: z.number().min(0).max(100),
  evidence: z.array(z.string().min(2).max(300)).min(1).max(5),
  humanReviewReason: z.string().max(300).nullable(),
});

export function parseGeminiDiagnosis(raw: string): Omit<Diagnosis, "mode"> {
  return diagnosisSchema.parse(JSON.parse(raw));
}

export function deterministicDiagnosis(recoveryCase: RecoveryCase): Diagnosis {
  const recommendation = getRecommendation(recoveryCase);
  return {
    rootCause: recoveryCase.rootCause,
    riskSummary: `${recoveryCase.lastSignal} INR ${recoveryCase.amountAtRisk.toLocaleString("en-IN")} is currently at risk.`,
    recommendedAction: recommendation.action,
    recommendedChannel: recoveryCase.channel,
    customerSafeCopy: recommendation.copy,
    confidence: recoveryCase.confidence,
    evidence: [recoveryCase.lastSignal, recoveryCase.rootCause],
    humanReviewReason:
      recoveryCase.amountAtRisk >= 25000 ? "High-value recovery: keep a human approver in the loop." : null,
    mode: "fallback",
  };
}

export async function diagnoseCase(recoveryCase: RecoveryCase): Promise<Diagnosis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return deterministicDiagnosis(recoveryCase);

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const prompt = [
    "You are a revenue recovery analyst. The input is fully synthetic demo data.",
    "Return only JSON matching the requested schema. Do not suggest coercion, harassment, or contacting someone without consent.",
    `Case kind: ${recoveryCase.kind}`,
    `Amount at risk INR: ${recoveryCase.amountAtRisk}`,
    `Root cause: ${recoveryCase.rootCause}`,
    `Latest signal: ${recoveryCase.lastSignal}`,
    `Preferred allowed channel: ${recoveryCase.channel}`,
    `Consent: ${recoveryCase.consent}; opted out: ${recoveryCase.optedOut}; contacts past week: ${recoveryCase.contactsPastWeek}; quiet hours: ${recoveryCase.isQuietHours}; promise due: ${recoveryCase.promiseDue ?? "none"}.`,
    "Required fields: rootCause, riskSummary, recommendedAction, recommendedChannel (Email|SMS|Voice|Payment link|Mandate), customerSafeCopy, confidence (0-100), evidence (1-5 strings), humanReviewReason (string or null).",
  ].join("\n");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
        }),
        cache: "no-store",
      },
    );
    if (!response.ok) throw new Error(`Gemini returned ${response.status}`);
    const payload = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("");
    if (!text) throw new Error("Gemini returned no structured content");
    return { ...parseGeminiDiagnosis(text), mode: "live_test" };
  } catch {
    return deterministicDiagnosis(recoveryCase);
  }
}
