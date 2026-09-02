import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

import type { AdapterMode, IntegrationHealth } from "./recovery-types";

export type DeliveryResult = {
  mode: AdapterMode;
  reference: string;
  detail: string;
};

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

export function isRazorpayTestModeConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_") && process.env.RAZORPAY_KEY_SECRET);
}

export function getIntegrationHealth(): IntegrationHealth[] {
  const supabase = Boolean(getSupabaseAdmin());
  const resend = Boolean(process.env.RESEND_API_KEY && process.env.DEMO_EMAIL_RECIPIENT);
  const razorpay = isRazorpayTestModeConfigured();
  return [
    { name: "Supabase", mode: supabase ? "live_test" : "fallback", detail: supabase ? "Free Supabase project is connected; private demo runs persist server-side." : "Zero-config fallback is serving the seeded private demo run." },
    { name: "Gemini", mode: process.env.GEMINI_API_KEY ? "live_test" : "fallback", detail: process.env.GEMINI_API_KEY ? "Gemini receives synthetic case signals only; schema validation remains enforced." : "Deterministic diagnosis engine is active until a Gemini free API key is configured." },
    { name: "Razorpay Test Mode", mode: razorpay ? "live_test" : "blocked", detail: razorpay ? "Test Checkout is available; recovery attribution waits for a verified webhook." : "Configure rzp_test_ credentials to enable Test Checkout. No real payments are possible." },
    { name: "Resend", mode: resend ? "live_test" : "fallback", detail: resend ? "Messages are restricted to the configured demo inbox." : "In-app outbox fallback is active; no email can be sent to judges." },
  ];
}

export async function persistAuditEvent(event: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { persisted: false, mode: "fallback" as const };
  const { error } = await supabase.from("recovery_audit_events").insert(event);
  if (error) throw new Error(`Supabase audit persistence failed: ${error.message}`);
  return { persisted: true, mode: "live_test" as const };
}

export async function sendRecoveryEmail(input: { subject: string; html: string }): Promise<DeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "RecoveryOS <onboarding@resend.dev>";
  const recipient = process.env.DEMO_EMAIL_RECIPIENT;
  if (!apiKey || !recipient) {
    return { mode: "fallback", reference: `OUTBOX-${Date.now()}`, detail: "Saved to the in-app outbox. Configure the restricted demo inbox to send a test email." };
  }
  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({ from, to: recipient, subject: input.subject, html: input.html });
    if (error) throw new Error(error.message);
    return { mode: "live_test", reference: data?.id ?? "resend-unknown", detail: "Sent only to the configured DEMO_EMAIL_RECIPIENT." };
  } catch (error) {
    return { mode: "fallback", reference: `OUTBOX-${Date.now()}`, detail: `Provider fallback: ${error instanceof Error ? error.message : "Resend unavailable"}` };
  }
}

function razorpayAuthHeader() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || !keyId.startsWith("rzp_test_")) return null;
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

export async function createRazorpayTestOrder(input: { amountPaise: number; receipt: string; notes: Record<string, string> }) {
  const authorization = razorpayAuthHeader();
  if (!authorization) return { ok: false as const, error: "Razorpay Test Mode is not configured." };
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: authorization, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: input.amountPaise, currency: "INR", receipt: input.receipt, notes: input.notes }),
    cache: "no-store",
  });
  if (!response.ok) return { ok: false as const, error: `Razorpay order creation failed (${response.status}).` };
  const order = (await response.json()) as { id: string; amount: number; currency: string };
  return { ok: true as const, order, keyId: process.env.RAZORPAY_KEY_ID! };
}

export function verifyRazorpayCheckoutSignature(input: { orderId: string; paymentId: string; signature: string }) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(`${input.orderId}|${input.paymentId}`).digest("hex");
  const received = Buffer.from(input.signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return received.length === expectedBuffer.length && timingSafeEqual(received, expectedBuffer);
}

export function verifyRazorpayWebhookSignature(body: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const received = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return received.length === expectedBuffer.length && timingSafeEqual(received, expectedBuffer);
}

export async function recordWebhookEvent(input: { eventId: string; eventType: string; payload: Record<string, unknown> }) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { deduplicated: false, persisted: false };
  const { error } = await supabase.from("webhook_events").insert({ provider: "razorpay", provider_event_id: input.eventId, event_type: input.eventType, payload: input.payload });
  if (!error) return { deduplicated: false, persisted: true };
  if (error.code === "23505") return { deduplicated: true, persisted: true };
  throw new Error(`Webhook persistence failed: ${error.message}`);
}

export function sharedPaymentLink() {
  return process.env.RAZORPAY_SHARED_PAYMENT_LINK_URL || null;
}
