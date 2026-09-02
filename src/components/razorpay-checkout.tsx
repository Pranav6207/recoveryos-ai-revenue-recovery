"use client";

import { useState } from "react";

declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void }; } }

function loadCheckout() { return new Promise<void>((resolve, reject) => { if (window.Razorpay) return resolve(); const script = document.createElement("script"); script.src = "https://checkout.razorpay.com/v1/checkout.js"; script.onload = () => resolve(); script.onerror = () => reject(new Error("Razorpay Checkout could not load.")); document.body.appendChild(script); }); }

export function RazorpayCheckout({ caseId, amount }: { caseId: string; amount: number }) {
  const [message, setMessage] = useState("Test Mode only. A successful checkout is not counted until a verified webhook arrives.");
  const [busy, setBusy] = useState(false);
  async function open() {
    setBusy(true); setMessage("Creating Test Mode order…");
    try {
      const response = await fetch("/api/razorpay/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ caseId }) });
      const result = await response.json() as { ok?: boolean; error?: string; keyId?: string; order?: { id: string; amount: number; currency: string } };
      if (!response.ok || !result.ok || !result.order || !result.keyId) throw new Error(result.error || "Unable to create Test Mode order.");
      await loadCheckout();
      const checkout = new window.Razorpay!({ key: result.keyId, amount: result.order.amount, currency: result.order.currency, name: "RecoveryOS", description: "Synthetic recovery proof", order_id: result.order.id, handler: async (payment: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => { const verify = await fetch("/api/razorpay/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ caseId, ...payment }) }); setMessage(verify.ok ? "Signature verified. Awaiting payment.captured webhook for recovery attribution." : "Checkout response could not be verified."); }, modal: { ondismiss: () => setMessage("Checkout dismissed. A drop-off signal is retained; no outreach was sent.") }, theme: { color: "#1d4ed8" } });
      checkout.open(); setMessage("Razorpay Test Checkout opened in a secure modal.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Checkout unavailable."); } finally { setBusy(false); }
  }
  return <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5"><p className="text-sm font-bold text-blue-950">Razorpay Test Checkout · ₹{amount.toLocaleString("en-IN")}</p><p className="mt-2 text-sm leading-6 text-blue-900">{message}</p><button onClick={open} disabled={busy} className="mt-4 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{busy ? "Preparing…" : "Open Test Checkout"}</button></section>;
}
