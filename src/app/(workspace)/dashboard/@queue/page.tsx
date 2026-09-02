import { loadWorkspace } from "@/lib/recovery-store";
import { CaseTable } from "@/components/workspace-server";
import { Zap, MoreHorizontal } from "lucide-react";
import Link from "next/link";

export default async function QueuePage() {
  const workspace = await loadWorkspace();
  
  // Sorted by risk score internally in store, just slice top 9
  const queue = workspace.cases.slice(0, 9);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <Zap className="size-3.5 fill-current" />
            </div>
            <h2 className="font-semibold text-slate-900">Recovery command queue</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">Sorted by risk score. Top 9 at-risk cases.</p>
        </div>
        <Link href="/cases" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900">
          <MoreHorizontal className="size-4" /> View all 120 cases
        </Link>
      </div>
      <CaseTable cases={queue} />
    </section>
  );
}
