import { loadWorkspace } from "@/lib/recovery-store";
import { MetricCard } from "@/components/workspace-server";
import { formatCurrency } from "@/lib/recovery-engine";
import { RecoveryChartWrapper } from "@/components/recovery-chart-wrapper";
import { BadgeCheck } from "lucide-react";

export default async function OverviewPage() {
  const workspace = await loadWorkspace();
  const { atRisk: amountAtRisk, recovered: amountRecovered, blockedCases, actionsTaken } = workspace.metrics;
  
  // Calculate a simulated ROI: let's assume average cost per action is ₹2.5
  const simulatedCost = actionsTaken * 2.5;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard 
          label="At-risk revenue" 
          value={`₹${formatCurrency(amountAtRisk)}`} 
          hint="120-event synthetic batch" 
          tone="amber" 
        />
        <MetricCard 
          label="Recovered" 
          value={`₹${formatCurrency(amountRecovered)}`} 
          hint={`${workspace.metrics.recoveryRate}% recovery rate`} 
          tone="green" 
        />
        <MetricCard 
          label="Policy-protected" 
          value={`${blockedCases} cases`} 
          hint="Stop rules prevented action" 
          tone="slate" 
        />
        <MetricCard 
          label="AI Action Cost" 
          value={`₹${formatCurrency(simulatedCost)}`} 
          hint={`${actionsTaken} actions executed`} 
          tone="blue" 
        />
      </div>

      <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_220px]">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Recovered this week</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">Recovery momentum</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              +31% vs baseline
            </span>
          </div>
          <div className="mt-4 h-32">
            <RecoveryChartWrapper />
          </div>
        </div>
        <div className="rounded-xl bg-slate-950 p-4 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Why it matters</p>
          <p className="mt-3 text-sm font-semibold leading-6">
            Each recovered payment is attributed exactly once—never inferred from a click or open.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-blue-400">
            <BadgeCheck className="size-4" /> Evidence-backed metrics
          </div>
        </div>
      </section>
    </div>
  );
}
