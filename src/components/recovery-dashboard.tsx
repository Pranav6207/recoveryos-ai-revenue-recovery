"use client";

import {
  ArrowUpRight,
  BadgeCheck,
  BellRing,
  Bot,
  CircleCheck,
  Clock3,
  FileText,
  Gauge,
  Headphones,
  LineChart,
  LockKeyhole,
  MessageSquare,
  MoreHorizontal,
  Play,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { createSeedAudit, createSeedCases, kindLabels, kindShortLabels, recoveryTrend } from "@/lib/recovery-data";
import {
  evaluatePolicy,
  executeDemoAction,
  formatCurrency,
  getRecommendation,
} from "@/lib/recovery-engine";
import type { AuditEvent, CaseStatus, RecoveryCase, RecoveryKind } from "@/lib/recovery-types";

const initialCases = createSeedCases();
const initialAudit = createSeedAudit(initialCases);

const statusStyles: Record<CaseStatus, string> = {
  at_risk: "border-amber-300 bg-amber-50 text-amber-800",
  in_progress: "border-sky-300 bg-sky-50 text-sky-800",
  promise_to_pay: "border-violet-300 bg-violet-50 text-violet-800",
  recovered: "border-emerald-300 bg-emerald-50 text-emerald-800",
  blocked: "border-rose-300 bg-rose-50 text-rose-800",
};

const statusLabels: Record<CaseStatus, string> = {
  at_risk: "At risk",
  in_progress: "In progress",
  promise_to_pay: "Promise active",
  recovered: "Recovered",
  blocked: "Blocked",
};

const kindIcons: Record<RecoveryKind, typeof WalletCards> = {
  payment_degradation: WalletCards,
  checkout_dropoff: ArrowUpRight,
  subscription_failure: RefreshCw,
  b2b_receivable: FileText,
  mandate_retry: Clock3,
  hinglish_voice: Headphones,
  promise_to_pay: MessageSquare,
};

const auditIcon: Record<AuditEvent["type"], typeof CircleCheck> = {
  signal: BellRing,
  ai: Bot,
  policy: ShieldCheck,
  action: Send,
  recovery: CircleCheck,
};

function MetricCard({
  label,
  value,
  detail,
  tone = "slate",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "slate" | "mint" | "amber" | "violet";
}) {
  const toneClasses = {
    slate: "from-white to-slate-50 border-slate-200",
    mint: "from-emerald-50 to-white border-emerald-100",
    amber: "from-amber-50 to-white border-amber-100",
    violet: "from-violet-50 to-white border-violet-100",
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 shadow-sm ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function StatusPill({ status }: { status: CaseStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold tracking-wide text-white">
      {initials}
    </div>
  );
}

export default function RecoveryDashboard() {
  const [cases, setCases] = useState<RecoveryCase[]>(initialCases);
  const [audit, setAudit] = useState<Record<string, AuditEvent[]>>(initialAudit);
  const [selectedId, setSelectedId] = useState(initialCases[0].id);
  const [kindFilter, setKindFilter] = useState<RecoveryKind | "all">("all");
  const [runId, setRunId] = useState("DEMO-7428");
  const [toast, setToast] = useState("Synthetic workspace ready. No external credentials required.");

  const selectedCase = cases.find((recoveryCase) => recoveryCase.id === selectedId) ?? cases[0];
  const policy = evaluatePolicy(selectedCase);
  const recommendation = getRecommendation(selectedCase);
  const selectedAudit = audit[selectedCase.id] ?? [];

  const metrics = useMemo(() => {
    const amountAtRisk = cases.reduce((sum, recoveryCase) => sum + recoveryCase.amountAtRisk, 0);
    const amountRecovered = cases.reduce((sum, recoveryCase) => sum + recoveryCase.amountRecovered, 0);
    const blocked = cases.filter(
      (recoveryCase) => recoveryCase.status !== "recovered" && !evaluatePolicy(recoveryCase).allowed,
    ).length;
    const actions = Object.values(audit).flat().filter((event) => event.type === "action").length;
    return { amountAtRisk, amountRecovered, blocked, actions, recoveryRate: (amountRecovered / amountAtRisk) * 100 };
  }, [audit, cases]);

  const queue = useMemo(
    () => cases
      .filter((recoveryCase) => kindFilter === "all" || recoveryCase.kind === kindFilter)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 9),
    [cases, kindFilter],
  );

  function startDemoRun() {
    setCases(createSeedCases());
    setAudit(createSeedAudit(createSeedCases()));
    setSelectedId(initialCases[0].id);
    setRunId(`DEMO-${Math.floor(1000 + Math.random() * 8999)}`);
    setToast("New isolated judge run created from the 120-case synthetic batch.");
  }

  function advanceDemoTime() {
    setToast("Demo time moved forward one day. Due actions are ready for review; no silent outreach was sent.");
  }

  function executeAction() {
    if (!policy.allowed) {
      setToast(`Action blocked: ${policy.title}. The stop rule was added to the audit trail.`);
      const blockedEvent: AuditEvent = {
        id: `${selectedCase.id}-blocked-${Date.now()}`,
        caseId: selectedCase.id,
        time: "Just now",
        title: "Action blocked by policy",
        detail: policy.detail,
        type: "policy",
      };
      setAudit((current) => ({ ...current, [selectedCase.id]: [...(current[selectedCase.id] ?? []), blockedEvent] }));
      return;
    }

    const result = executeDemoAction(selectedCase);
    setCases((current) => current.map((recoveryCase) => recoveryCase.id === selectedCase.id ? result.updatedCase : recoveryCase));
    setAudit((current) => ({ ...current, [selectedCase.id]: [...(current[selectedCase.id] ?? []), ...result.auditEvents] }));
    setToast(result.updatedCase.status === "recovered"
      ? `Recovery confirmed: INR ${formatCurrency(result.updatedCase.amountRecovered)} attributed once to ${selectedCase.id}.`
      : "Bounded action executed in the selected simulator. The case remains safely tracked.");
  }

  function previewVoice() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(recommendation.copy);
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
      setToast("Playing the safe Hinglish recovery-script preview in your browser.");
      return;
    }
    setToast("Voice preview is unavailable in this browser; the transcript remains available for review.");
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1680px]">
        <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-[#0b1326] px-4 py-5 text-slate-300 lg:flex lg:flex-col">
          <div className="flex items-center gap-2 px-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#f5b544] text-slate-950 shadow-[0_8px_20px_rgba(245,181,68,.18)]">
              <Zap className="size-5 fill-current" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-white">RecoveryOS</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Command center</p>
            </div>
          </div>

          <nav className="mt-10 space-y-1 text-sm">
            {[
              [Gauge, "Recovery desk", true],
              [LineChart, "Batch analytics", false],
              [FileText, "Cases & evidence", false],
              [ShieldCheck, "Policy controls", false],
            ].map(([Icon, label, active]) => {
              const NavIcon = Icon as typeof Gauge;
              return (
                <button key={label as string} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
                  <NavIcon className="size-4" />
                  {label as string}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-white"><Sparkles className="size-4 text-[#f5b544]" />Judge-ready demo</div>
            <p className="mt-2 text-xs leading-5 text-slate-400">120 synthetic cases. Every workflow runs without payment, email, or voice credentials.</p>
            <button onClick={startDemoRun} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#f5b544] px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-[#ffd271]">
              <RotateCcw className="size-3.5" /> Reset this run
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3.5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-slate-950 text-[#f5b544] lg:hidden"><Zap className="size-4 fill-current" /></div>
              <div>
                <p className="text-sm font-semibold text-slate-900">AI Revenue Recovery</p>
                <p className="text-xs text-slate-500">Find revenue that&apos;s slipping away and win it back.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 sm:inline-flex">{runId} · isolated demo</span>
              <button onClick={advanceDemoTime} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"><Clock3 className="size-3.5" />Advance demo time</button>
              <button onClick={startDemoRun} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"><Play className="size-3.5 fill-current" />Start demo</button>
            </div>
          </header>

          <div className="px-5 py-6 sm:px-8 xl:px-10">
            <div className="rounded-2xl border border-amber-200 bg-[#fff8e8] px-4 py-3 text-sm text-amber-950 shadow-sm">
              <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-700" /><p><span className="font-bold">Demo-safe workspace.</span> All data and outcomes are synthetic. The agent can recommend and execute only bounded, policy-approved simulator actions.</p></div>
            </div>

            <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recovery overview</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Turn risk signals into <span className="text-[#b26b00]">recovered revenue.</span></h1>
              </div>
              <p className="max-w-md text-sm leading-6 text-slate-500">One agent, seven playbooks, evidence at every decision. Built for transparent recovery—not aggressive chasing.</p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="At-risk revenue" value={`₹${formatCurrency(metrics.amountAtRisk)}`} detail="120-event synthetic batch" tone="amber" />
              <MetricCard label="Recovered" value={`₹${formatCurrency(metrics.amountRecovered)}`} detail={`${metrics.recoveryRate.toFixed(1)}% recovery rate`} tone="mint" />
              <MetricCard label="Policy-protected" value={`${metrics.blocked} cases`} detail="Stop rules prevented action" tone="violet" />
              <MetricCard label="Actions executed" value={`${metrics.actions}`} detail="Only after policy approval" tone="slate" />
            </div>

            <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1.5fr)_minmax(390px,.8fr)]">
              <div className="min-w-0 space-y-6">
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                    <div>
                      <div className="flex items-center gap-2"><div className="flex size-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800"><Zap className="size-3.5 fill-current" /></div><h2 className="font-semibold text-slate-900">Recovery command queue</h2></div>
                      <p className="mt-1 text-xs text-slate-500">Sorted by risk score and filtered to the playbook you want to inspect.</p>
                    </div>
                    <button onClick={() => setKindFilter("all")} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"><MoreHorizontal className="size-4" />View all 120 cases</button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto border-b border-slate-100 px-5 py-3">
                    <button onClick={() => setKindFilter("all")} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${kindFilter === "all" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>All playbooks</button>
                    {(Object.keys(kindLabels) as RecoveryKind[]).map((kind) => <button key={kind} onClick={() => setKindFilter(kind)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${kindFilter === kind ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{kindShortLabels[kind]}</button>)}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left">
                      <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500"><tr><th className="px-5 py-3">Customer</th><th className="px-3 py-3">Signal / playbook</th><th className="px-3 py-3">At risk</th><th className="px-3 py-3">Risk</th><th className="px-5 py-3">State</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {queue.map((recoveryCase) => {
                          const Icon = kindIcons[recoveryCase.kind];
                          const isSelected = recoveryCase.id === selectedCase.id;
                          return <tr key={recoveryCase.id} data-testid={`case-row-${recoveryCase.id}`} onClick={() => setSelectedId(recoveryCase.id)} className={`cursor-pointer transition ${isSelected ? "bg-amber-50/70" : "hover:bg-slate-50"}`}>
                            <td className="px-5 py-3.5"><div className="flex items-center gap-2.5"><Avatar initials={recoveryCase.customerInitials} /><div><p className="text-sm font-semibold text-slate-800">{recoveryCase.customer}</p><p className="text-[11px] text-slate-500">{recoveryCase.id} · {recoveryCase.segment}</p></div></div></td>
                            <td className="px-3 py-3.5"><div className="flex items-center gap-2"><Icon className="size-3.5 text-[#b26b00]" /><span className="text-xs font-medium text-slate-700">{kindLabels[recoveryCase.kind]}</span></div></td>
                            <td className="px-3 py-3.5 text-sm font-semibold text-slate-900">₹{formatCurrency(recoveryCase.amountAtRisk)}</td>
                            <td className="px-3 py-3.5"><div className="flex items-center gap-2"><div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#f0a92e]" style={{ width: `${recoveryCase.riskScore}%` }} /></div><span className="text-xs font-bold text-slate-700">{recoveryCase.riskScore}</span></div></td>
                            <td className="px-5 py-3.5"><StatusPill status={recoveryCase.status} /></td>
                          </tr>;
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_220px]">
                  <div>
                    <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Recovered this week</p><h2 className="mt-1 text-lg font-semibold text-slate-900">Recovery momentum</h2></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">+31% vs baseline</span></div>
                    <div className="mt-4 h-32"><ResponsiveContainer width="100%" height="100%"><AreaChart data={recoveryTrend} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}><defs><linearGradient id="recoveryGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#f5b544" stopOpacity={0.45} /><stop offset="100%" stopColor="#f5b544" stopOpacity={0.02} /></linearGradient></defs><XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} dy={8} /><Tooltip cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(value) => [`₹${formatCurrency(Number(value) * 1000)}k`, "Recovered"]} /><Area type="monotone" dataKey="recovered" stroke="#c97900" strokeWidth={2.5} fill="url(#recoveryGradient)" /></AreaChart></ResponsiveContainer></div>
                  </div>
                  <div className="rounded-xl bg-slate-950 p-4 text-white"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Why it matters</p><p className="mt-3 text-sm font-semibold leading-6">Each recovered payment is attributed once—never inferred from a click.</p><div className="mt-4 flex items-center gap-2 text-xs text-[#f5b544]"><BadgeCheck className="size-4" />Evidence-backed metric</div></div>
                </section>
              </div>

              <aside className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-5">
                  <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><Avatar initials={selectedCase.customerInitials} /><div><p className="text-sm font-semibold text-slate-900">{selectedCase.customer}</p><p className="text-xs text-slate-500">{selectedCase.id} · {selectedCase.segment}</p></div></div><StatusPill status={selectedCase.status} /></div>
                  <div className="mt-4 flex flex-wrap gap-2"><span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">₹{formatCurrency(selectedCase.amountAtRisk)} at risk</span><span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">{selectedCase.confidence}% AI confidence</span><span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">{kindLabels[selectedCase.kind]}</span></div>
                </div>

                <div className="space-y-5 p-5">
                  <section><div className="flex items-center gap-2"><Bot className="size-4 text-violet-700" /><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">AI recommendation</p></div><h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">{recommendation.action}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{recommendation.rationale}</p><div className="mt-3 rounded-xl border border-violet-100 bg-violet-50 p-3"><p className="text-xs font-semibold text-violet-900">{recommendation.channel} draft</p><p className="mt-1 text-xs leading-5 text-violet-800">“{recommendation.copy}”</p></div></section>

                  {selectedCase.kind === "hinglish_voice" && <section className="rounded-xl border border-slate-200 bg-slate-50 p-3.5"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Headphones className="size-4 text-[#b26b00]" /><p className="text-xs font-bold text-slate-700">Hinglish call preview</p></div><button onClick={previewVoice} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"><Play className="size-3 fill-current" />Listen</button></div><p className="mt-2 text-xs leading-5 text-slate-600">Script is shown for review before any call. The demo captures a simulated customer outcome only.</p></section>}

                  <section className={`rounded-xl border p-3.5 ${policy.allowed ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}><div className="flex gap-2"><div className={`mt-0.5 ${policy.allowed ? "text-emerald-700" : "text-rose-700"}`}>{policy.allowed ? <ShieldCheck className="size-4" /> : <LockKeyhole className="size-4" />}</div><div><p data-testid="policy-title" className={`text-xs font-bold ${policy.allowed ? "text-emerald-900" : "text-rose-900"}`}>{policy.title}</p><p className={`mt-1 text-xs leading-5 ${policy.allowed ? "text-emerald-800" : "text-rose-800"}`}>{policy.detail}</p></div></div><p className={`mt-2 border-t pt-2 text-[11px] font-medium ${policy.allowed ? "border-emerald-200 text-emerald-800" : "border-rose-200 text-rose-800"}`}>Next: {policy.nextStep}</p></section>

                  <button onClick={executeAction} className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${policy.allowed ? "bg-[#f5b544] text-slate-950 hover:bg-[#ffd271]" : "bg-slate-900 text-white hover:bg-slate-800"}`}><Zap className="size-4 fill-current" />{policy.allowed ? "Approve & execute bounded action" : "Show policy block in audit"}</button>

                  <section className="border-t border-slate-100 pt-4"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">Audit evidence</p><span className="text-[11px] font-semibold text-slate-400">{selectedAudit.length} events</span></div><div className="mt-3 space-y-3">{selectedAudit.slice().reverse().slice(0, 5).map((event) => { const Icon = auditIcon[event.type]; return <div key={event.id} className="flex gap-2.5"><div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600"><Icon className="size-3" /></div><div><div className="flex items-baseline gap-2"><p className="text-xs font-semibold text-slate-800">{event.title}</p><span className="text-[10px] text-slate-400">{event.time}</span></div><p className="mt-0.5 text-[11px] leading-4 text-slate-500">{event.detail}</p></div></div>; })}</div></section>
                </div>
              </aside>
            </div>

            <div aria-live="polite" className="mt-5 flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-600 shadow-sm"><CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />{toast}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
