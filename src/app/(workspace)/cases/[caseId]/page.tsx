import { notFound } from "next/navigation";
import { findCase } from "@/lib/recovery-store";
import { evaluatePolicy } from "@/lib/recovery-engine";
import { DiagnosisPanel } from "@/components/diagnosis-panel";
import { ActionControls } from "@/components/action-controls";
import { AuditTimeline, PageTitle, StatusPill } from "@/components/workspace-server";
import { formatCurrency } from "@/lib/recovery-engine";
import { ShieldCheck, LockKeyhole } from "lucide-react";
import { AIReasoningTrace } from "@/components/ai-reasoning-trace";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const { workspace, recoveryCase } = await findCase(caseId);

  if (!recoveryCase) return notFound();

  // Initial diagnosis/recommendation (fallback or live)
  const initialDiagnosis = {
    mode: "simulated" as const,
    rootCause: "Awaiting LLM diagnosis...",
    recommendedAction: "Awaiting recommendation",
    recommendedChannel: "Email" as const,
    customerSafeCopy: "...",
    humanReviewReason: null,
    riskSummary: "Loading risk profile...",
    confidence: 0,
    evidence: [],
  };

  const policy = evaluatePolicy(recoveryCase);
  const auditEvents = workspace.audit[caseId] || [];

  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Case Details" title={recoveryCase.id}>
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill status={recoveryCase.status} />
          <span className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
            ₹{formatCurrency(recoveryCase.amountAtRisk)} at risk
          </span>
        </div>
      </PageTitle>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.5fr)_minmax(390px,.8fr)]">
        <div className="space-y-6 min-w-0">
          <DiagnosisPanel recoveryCase={recoveryCase} initial={initialDiagnosis} />
          
          <AIReasoningTrace recoveryCase={recoveryCase} />

          <section className={`rounded-xl border p-5 shadow-sm ${policy.allowed ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
            <div className="flex gap-3">
              <div className={`mt-1 ${policy.allowed ? "text-emerald-700" : "text-rose-700"}`}>
                {policy.allowed ? <ShieldCheck className="size-5" /> : <LockKeyhole className="size-5" />}
              </div>
              <div>
                <p className={`font-bold text-lg ${policy.allowed ? "text-emerald-900" : "text-rose-900"}`}>
                  {policy.title}
                </p>
                <p className={`mt-1 text-sm leading-6 ${policy.allowed ? "text-emerald-800" : "text-rose-800"}`}>
                  {policy.detail}
                </p>
              </div>
            </div>
            <p className={`mt-3 border-t pt-3 text-xs font-semibold ${policy.allowed ? "border-emerald-200 text-emerald-800" : "border-rose-200 text-rose-800"}`}>
              Next: {policy.nextStep}
            </p>
          </section>

          <ActionControls recoveryCase={recoveryCase} policy={policy} />
        </div>

        <aside className="space-y-6 min-w-0">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-5">Audit Evidence</h3>
            <AuditTimeline events={auditEvents.slice().reverse()} />
          </div>
        </aside>
      </div>
    </div>
  );
}
