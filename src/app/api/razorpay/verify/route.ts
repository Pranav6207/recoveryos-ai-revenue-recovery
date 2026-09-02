import { verifyRazorpayCheckoutSignature } from "@/lib/integrations";
import { findCase, persistCaseUpdate } from "@/lib/recovery-store";
import type { AuditEvent } from "@/lib/recovery-types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { caseId?: string; razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string } | null;
  if (!body?.caseId || !body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) return Response.json({ error: "Missing checkout verification fields." }, { status: 400 });
  const verified = verifyRazorpayCheckoutSignature({ orderId: body.razorpay_order_id, paymentId: body.razorpay_payment_id, signature: body.razorpay_signature });
  if (!verified) return Response.json({ verified: false, error: "Invalid Razorpay checkout signature." }, { status: 401 });
  const { workspace, recoveryCase } = await findCase(body.caseId);
  if (!recoveryCase) return Response.json({ error: "Recovery case not found." }, { status: 404 });
  const event: AuditEvent = { id: `${recoveryCase.id}-checkout-verified-${Date.now()}`, caseId: recoveryCase.id, time: "Just now", title: "Checkout signature verified", detail: "Test Checkout completed. Recovery remains awaiting a verified payment.captured webhook before value is credited.", type: "action", adapterMode: "live_test" };
  await persistCaseUpdate({ workspace, recoveryCase, events: [event], action: { mode: "live_test", detail: event.detail, providerReference: body.razorpay_payment_id } });
  return Response.json({ verified: true, status: "awaiting_webhook" });
}
