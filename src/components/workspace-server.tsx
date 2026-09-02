import Link from "next/link";
import type { ReactNode } from "react";

import { formatCurrency } from "@/lib/recovery-engine";
import { kindLabels } from "@/lib/recovery-data";
import type { AdapterMode, AuditEvent, RecoveryCase } from "@/lib/recovery-types";

export function modeLabel(mode: AdapterMode) {
  return { live_test: "Live Test", simulated: "Simulated", fallback: "Fallback", blocked: "Blocked" }[mode];
}

export function ModePill({ mode }: { mode: AdapterMode }) {
  const style = {
    live_test: "bg-emerald-100 text-emerald-800 border-emerald-200",
    simulated: "bg-sky-100 text-sky-800 border-sky-200",
    fallback: "bg-amber-100 text-amber-800 border-amber-200",
    blocked: "bg-rose-100 text-rose-800 border-rose-200",
  }[mode];
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${style}`}>{modeLabel(mode)}</span>;
}

export function PageTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return <header className="mb-7 flex flex-col gap-3 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">{eyebrow}</p><h1 className="text-3xl font-black tracking-tight text-slate-950">{title}</h1></div>{children}</header>;
}

export function MetricCard({ label, value, hint, tone = "slate" }: { label: string; value: string; hint: string; tone?: "slate" | "green" | "blue" | "amber" }) {
  const toneClass = { slate: "border-slate-200", green: "border-emerald-200", blue: "border-blue-200", amber: "border-amber-200" }[tone];
  return <article className={`rounded-2xl border bg-white p-5 shadow-sm ${toneClass}`}><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-3 text-3xl font-black text-slate-950">{value}</p><p className="mt-2 text-sm text-slate-500">{hint}</p></article>;
}

export function CaseTable({ cases, limit }: { cases: RecoveryCase[]; limit?: number }) {
  const visible = typeof limit === "number" ? cases.slice(0, limit) : cases;
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Case</th><th className="px-5 py-3">Playbook</th><th className="px-5 py-3">At risk</th><th className="px-5 py-3">Signal</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((recoveryCase) => <tr key={recoveryCase.id} className="transition hover:bg-blue-50/60"><td className="px-5 py-4"><Link className="font-bold text-slate-900 hover:text-blue-700" href={`/cases/${recoveryCase.id}`}>{recoveryCase.id}</Link><p className="mt-0.5 text-xs text-slate-500">{recoveryCase.customer}</p></td><td className="px-5 py-4 text-slate-700">{kindLabels[recoveryCase.kind]}</td><td className="px-5 py-4 font-bold text-slate-900">₹{formatCurrency(recoveryCase.amountAtRisk)}</td><td className="max-w-80 px-5 py-4 text-slate-500"><span className="line-clamp-2">{recoveryCase.lastSignal}</span></td><td className="px-5 py-4"><StatusPill status={recoveryCase.status} /></td></tr>)}</tbody></table></div></div>;
}

export function StatusPill({ status }: { status: RecoveryCase["status"] }) {
  const style = { at_risk: "bg-amber-100 text-amber-800", in_progress: "bg-blue-100 text-blue-800", promise_to_pay: "bg-violet-100 text-violet-800", recovered: "bg-emerald-100 text-emerald-800", blocked: "bg-rose-100 text-rose-800" }[status];
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${style}`}>{status.replaceAll("_", " ")}</span>;
}

export function AuditTimeline({ events }: { events: AuditEvent[] }) {
  return <ol className="space-y-4">{events.map((event) => <li key={event.id} className="relative border-l-2 border-slate-200 pl-5"><span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-blue-600" /><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-slate-900">{event.title}</p>{event.adapterMode && <ModePill mode={event.adapterMode} />}</div><p className="mt-1 text-sm leading-6 text-slate-600">{event.detail}</p><p className="mt-1 text-xs font-medium text-slate-400">{event.time}</p></li>)}</ol>;
}
