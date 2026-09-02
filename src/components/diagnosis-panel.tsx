"use client";

import { useState } from "react";
import type { Diagnosis, RecoveryCase } from "@/lib/recovery-types";
import { ModePill } from "./workspace-server";

export function DiagnosisPanel({ recoveryCase, initial }: { recoveryCase: RecoveryCase; initial: Diagnosis }) {
  const [diagnosis, setDiagnosis] = useState(initial);
  const [loading, setLoading] = useState(false);
  async function refresh() {
    setLoading(true);
    try { const response = await fetch(`/api/cases/${recoveryCase.id}/analyze`, { method: "POST" }); const payload = await response.json() as { diagnosis?: Diagnosis }; if (payload.diagnosis) setDiagnosis(payload.diagnosis); } finally { setLoading(false); }
  }
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold text-slate-950">AI diagnosis</p><p className="text-sm text-slate-500">Synthetic signals only · policy still has final authority</p></div><div className="flex items-center gap-2"><ModePill mode={diagnosis.mode} /><button onClick={refresh} disabled={loading} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">{loading ? "Analysing…" : "Refresh diagnosis"}</button></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Root cause</p><p className="mt-1 text-sm leading-6 text-slate-800">{diagnosis.rootCause}</p></div><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Recommendation</p><p className="mt-1 text-sm leading-6 text-slate-800">{diagnosis.recommendedAction} via {diagnosis.recommendedChannel}</p></div></div><blockquote className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">“{diagnosis.customerSafeCopy}”</blockquote>{diagnosis.humanReviewReason && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Human review: {diagnosis.humanReviewReason}</p>}</section>;
}
