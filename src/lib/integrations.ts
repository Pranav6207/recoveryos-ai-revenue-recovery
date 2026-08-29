import "server-only";

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export type DeliveryResult = {
  mode: "simulated" | "live";
  reference: string;
  detail: string;
};

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

export async function persistAuditEvent(event: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { persisted: false, mode: "demo" as const };
  const { error } = await supabase.from("recovery_audit_events").insert(event);
  if (error) throw new Error(`Supabase audit persistence failed: ${error.message}`);
  return { persisted: true, mode: "supabase" as const };
}

export async function sendRecoveryEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<DeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const liveDeliveryEnabled = process.env.ENABLE_LIVE_OUTREACH === "true";

  if (!apiKey || !from || !liveDeliveryEnabled) {
    return {
      mode: "simulated",
      reference: `OUTBOX-${Date.now()}`,
      detail: "Saved to the in-app demo outbox. No external email was sent.",
    };
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({ from, ...input });
  if (error) throw new Error(`Resend delivery failed: ${error.message}`);
  return { mode: "live", reference: data?.id ?? "unknown", detail: "Delivered by Resend." };
}

export async function createRazorpayPaymentLink(input: {
  amountPaise: number;
  referenceId: string;
  customer: { name: string; email?: string; contact?: string };
  description: string;
}): Promise<DeliveryResult> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const liveDeliveryEnabled = process.env.ENABLE_LIVE_OUTREACH === "true";

  if (!keyId || !keySecret || !liveDeliveryEnabled) {
    return {
      mode: "simulated",
      reference: `https://demo.recoveryos.app/pay/${input.referenceId}`,
      detail: "Demo payment link created. Configure Razorpay Test Mode keys to use a real test link.",
    };
  }

  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/payment_links", {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: "INR",
      reference_id: input.referenceId,
      description: input.description,
      customer: input.customer,
      notify: { email: Boolean(input.customer.email), sms: Boolean(input.customer.contact) },
      reminder_enable: false,
    }),
  });
  if (!response.ok) throw new Error(`Razorpay payment-link request failed with status ${response.status}.`);
  const payload = await response.json() as { short_url?: string; id?: string };
  return { mode: "live", reference: payload.short_url ?? payload.id ?? input.referenceId, detail: "Razorpay Test Mode payment link created." };
}
