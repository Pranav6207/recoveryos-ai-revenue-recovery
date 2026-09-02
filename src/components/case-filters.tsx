"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { recoveryKinds, type RecoveryKind } from "@/lib/recovery-types";
import { kindLabels } from "@/lib/recovery-data";

export function CaseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(key); else params.set(key, value);
    router.replace(`/cases${params.size ? `?${params}` : ""}`);
  };
  return <div className="flex flex-wrap gap-3"><label className="text-sm font-semibold text-slate-600">Playbook <select value={searchParams.get("kind") || "all"} onChange={(event) => update("kind", event.target.value)} className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"><option value="all">All playbooks</option>{recoveryKinds.map((kind: RecoveryKind) => <option key={kind} value={kind}>{kindLabels[kind]}</option>)}</select></label><label className="text-sm font-semibold text-slate-600">Status <select value={searchParams.get("status") || "all"} onChange={(event) => update("status", event.target.value)} className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"><option value="all">All statuses</option><option value="at_risk">At risk</option><option value="in_progress">In progress</option><option value="promise_to_pay">Promise-to-pay</option><option value="recovered">Recovered</option><option value="blocked">Blocked</option></select></label></div>;
}
