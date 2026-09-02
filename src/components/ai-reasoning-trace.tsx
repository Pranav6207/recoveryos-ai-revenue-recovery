"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Cpu } from "lucide-react";
import type { RecoveryCase } from "@/lib/recovery-types";

export function AIReasoningTrace({ recoveryCase }: { recoveryCase: RecoveryCase }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <button 
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between bg-slate-50 px-5 py-4 text-left transition hover:bg-slate-100"
      >
        <div className="flex items-center gap-2">
          <Cpu className="size-4 text-slate-500" />
          <span className="text-sm font-bold text-slate-900">Explainable AI Trace</span>
        </div>
        {open ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
      </button>
      
      {open && (
        <div className="border-t border-slate-100 p-5 bg-slate-950 text-slate-300">
          <p className="text-xs font-mono mb-2 text-slate-500">{"// Simulated Context Provided to LLM"}</p>
          <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed">
{`{
  "context": "Customer ${recoveryCase.customer} (Segment: ${recoveryCase.segment})",
  "risk_score": ${recoveryCase.riskScore},
  "amount_at_risk": ${recoveryCase.amountAtRisk},
  "playbook": "${recoveryCase.kind}",
  "confidence_threshold_met": ${recoveryCase.confidence > 75 ? "true" : "false"},
  "history": "No recent aggressive outreach. Favorable LTV."
}`}
          </pre>
          <p className="text-xs font-mono mt-4 mb-2 text-slate-500">{"// Inference Trace"}</p>
          <div className="text-xs font-mono bg-white/5 p-3 rounded leading-5">
            1. Evaluated risk score ({recoveryCase.riskScore}) against threshold (70).<br/>
            2. High confidence ({recoveryCase.confidence}%) indicates non-malicious failure.<br/>
            3. Selected gentle reminder template instead of immediate suspension.<br/>
            4. Generated customer-safe copy for review.
          </div>
        </div>
      )}
    </section>
  );
}
