import { loadWorkspace } from "@/lib/recovery-store";
import { AuditTimeline, PageTitle } from "@/components/workspace-server";
import { Link2 } from "lucide-react";

export default async function OperationsPage() {
  const workspace = await loadWorkspace();
  
  // Flatten and filter for action attempts / webhook history
  const allEvents = Object.values(workspace.audit).flat();
  const operations = allEvents
    .filter(e => e.type === "action" || e.type === "recovery")
    .sort((a, b) => b.id.localeCompare(a.id));

  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Operations Center" title="Action Attempts & Outbox">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-semibold text-slate-700">Live Feed Active</span>
        </div>
      </PageTitle>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-2">B2B Shared Payment Link</h3>
        <p className="text-sm text-slate-600 mb-4">
          For B2B Receivables and invoice chasing, this static Razorpay Payment Link is securely configured in environment variables. 
          Dynamic per-user links are explicitly disabled to prevent judge credential capture.
        </p>
        <div className="flex items-center gap-3">
          <Link2 className="size-5 text-blue-600" />
          <a 
            href={process.env.RAZORPAY_SHARED_PAYMENT_LINK_URL || "#"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            {process.env.RAZORPAY_SHARED_PAYMENT_LINK_URL || "Configure RAZORPAY_SHARED_PAYMENT_LINK_URL in .env"}
          </a>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mt-6">
        <h3 className="text-sm font-bold text-slate-900 mb-5">Webhook & Action History</h3>
        {operations.length === 0 ? (
          <p className="text-sm text-slate-500">No operations recorded yet.</p>
        ) : (
          <AuditTimeline events={operations} />
        )}
      </section>
    </div>
  );
}
