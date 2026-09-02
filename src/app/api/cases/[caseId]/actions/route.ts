import { executeDemoAction, evaluatePolicy, getRecommendation } from "@/lib/recovery-engine";
import { sendRecoveryEmail } from "@/lib/integrations";
import { findCase, persistCaseUpdate, persistEmailAttempt } from "@/lib/recovery-store";
import type { AuditEvent } from "@/lib/recovery-types";

export const runtime = "nodejs";

export async function POST(_request: Request, context: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await context.params;
  const { workspace, recoveryCase } = await findCase(caseId);
  if (!recoveryCase) return Response.json({ error: "Recovery case not found." }, { status: 404 });

  const policy = evaluatePolicy(recoveryCase);
  if (!policy.allowed) {
    const event: AuditEvent = {
      id: `${recoveryCase.id}-blocked-${Date.now()}`,
      caseId: recoveryCase.id,
      time: "Just now",
      title: "Action blocked by policy",
      detail: `${policy.title}: ${policy.detail}`,
      type: "policy",
      adapterMode: "blocked",
    };
    await persistCaseUpdate({ workspace, recoveryCase, events: [event], action: { mode: "blocked", detail: policy.title } });
    return Response.json({ allowed: false, policy, event }, { status: 409 });
  }

  const result = executeDemoAction(recoveryCase);
  const recommendation = getRecommendation(recoveryCase);
  let adapterMode: "simulated" | "live_test" | "fallback" = "simulated";
  let providerReference: string | undefined;
  let providerDetail = "Policy-controlled simulated action completed.";
  if (recoveryCase.channel === "Email") {
    const delivery = await sendRecoveryEmail({
      subject: `RecoveryOS demo: ${recommendation.action}`,
      html: `<p>${recommendation.copy}</p><p>This is a synthetic RecoveryOS Test Mode demo.</p>`,
    });
    adapterMode = delivery.mode === "live_test" ? "live_test" : "fallback";
    providerReference = delivery.reference;
    providerDetail = delivery.detail;
    await persistEmailAttempt({ workspace, caseCode: recoveryCase.id, mode: delivery.mode, reference: delivery.reference, detail: delivery.detail });
  }
  const events = result.auditEvents.map((event) => ({ ...event, adapterMode }));
  await persistCaseUpdate({
    workspace,
    recoveryCase: result.updatedCase,
    events,
    action: { mode: adapterMode, detail: providerDetail, providerReference },
  });
  return Response.json({ allowed: true, updatedCase: result.updatedCase, auditEvents: events, adapterMode, providerDetail });
}
