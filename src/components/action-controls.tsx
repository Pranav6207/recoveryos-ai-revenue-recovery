"use client";

import { useOptimistic, useState } from "react";
import type { AuditEvent, PolicyDecision, RecoveryCase } from "@/lib/recovery-types";

type Result = { allowed?: boolean; updatedCase?: RecoveryCase; auditEvents?: AuditEvent[]; policy?: PolicyDecision; providerDetail?: string; event?: AuditEvent };

export function ActionControls({ recoveryCase, policy }: { recoveryCase: RecoveryCase; policy: PolicyDecision }) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(recoveryCase.status);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function execute() {
    setBusy(true); setMessage(null); setOptimisticStatus("in_progress");
    try {
      const response = await fetch(`/api/cases/${recoveryCase.id}/actions`, { method: "POST" });
      const payload = (await response.json()) as Result;
      if (!response.ok || !payload.allowed) { setOptimisticStatus(recoveryCase.status); setMessage(payload.policy?.title || "Action was blocked by policy."); return; }
      setOptimisticStatus(payload.updatedCase?.status || "in_progress");
      setMessage(payload.providerDetail || "Action completed. Refreshing evidence from the server.");
    } catch { setOptimisticStatus(recoveryCase.status); setMessage("Action could not be completed. The case was not changed."); } finally { setBusy(false); }
  }
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold text-slate-950">Bounded recovery action</p><p className="mt-1 text-sm text-slate-600">Current status: <span className="font-bold">{optimisticStatus.replaceAll("_", " ")}</span></p></div></div><p className="mt-4 text-sm leading-6 text-slate-600">{policy.detail}</p><button onClick={execute} disabled={!policy.allowed || busy} className="mt-5 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300">{busy ? "Executing safely…" : policy.allowed ? "Approve & execute bounded action" : "Action blocked by policy"}</button>{message && <p role="status" className="mt-3 text-sm font-medium text-slate-700">{message}</p>}</section>;
}
