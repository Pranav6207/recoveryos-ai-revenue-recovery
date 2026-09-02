import { findCase, persistCaseUpdate } from "@/lib/recovery-store";
import { recordWebhookEvent, verifyRazorpayWebhookSignature } from "@/lib/integrations";
import type { AuditEvent } from "@/lib/recovery-types";

export const runtime = "nodejs";

type RazorpayWebhook = {
  event?: string;
  created_at?: number;
  payload?: { payment?: { entity?: { id?: string; notes?: { recovery_case?: string } } } };
};

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const eventId = request.headers.get("x-razorpay-event-id");
  if (!eventId || !verifyRazorpayWebhookSignature(body, signature)) return Response.json({ accepted: false, error: "Invalid or unconfigured Razorpay webhook signature." }, { status: 401 });

  let payload: RazorpayWebhook;
  try { payload = JSON.parse(body) as RazorpayWebhook; } catch { return Response.json({ accepted: false, error: "Webhook body is not valid JSON." }, { status: 400 }); }
  const createdAt = typeof payload.created_at === "number" ? payload.created_at * 1000 : Date.now();
  if (Date.now() - createdAt > 7 * 24 * 60 * 60 * 1000) return Response.json({ accepted: false, error: "Stale webhook event rejected." }, { status: 409 });
  const stored = await recordWebhookEvent({ eventId, eventType: payload.event || "unknown", payload: payload as Record<string, unknown> });
  if (stored.deduplicated) return Response.json({ accepted: true, deduplicated: true, eventId });

  const caseId = payload.payload?.payment?.entity?.notes?.recovery_case;
  if (payload.event === "payment.captured" && caseId) {
    const { workspace, recoveryCase } = await findCase(caseId);
    if (recoveryCase && recoveryCase.status !== "recovered") {
      const updatedCase = { ...recoveryCase, status: "recovered" as const, amountRecovered: recoveryCase.amountAtRisk, latestAction: "Verified Razorpay Test Mode capture" };
      const event: AuditEvent = { id: `${caseId}-webhook-${eventId}`, caseId, time: "Just now", title: "Verified payment.captured webhook", detail: `Razorpay webhook ${eventId} credited INR ${recoveryCase.amountAtRisk.toLocaleString("en-IN")} exactly once.`, type: "recovery", adapterMode: "live_test" };
      await persistCaseUpdate({ workspace, recoveryCase: updatedCase, events: [event], action: { mode: "live_test", detail: event.detail, providerReference: payload.payload?.payment?.entity?.id } });
    }
  }
  return Response.json({ accepted: true, deduplicated: false, eventId });
}
