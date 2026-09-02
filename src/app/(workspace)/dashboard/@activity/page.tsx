import { loadWorkspace } from "@/lib/recovery-store";
import { AuditTimeline } from "@/components/workspace-server";
import { LiveFeedRefresher } from "@/components/live-feed-refresher";

export default async function ActivityPage() {
  const workspace = await loadWorkspace();
  
  // Flatten all audit events, sort by newest
  const allEvents = Object.values(workspace.audit)
    .flat()
    .sort((a, b) => b.id.localeCompare(a.id)) // rough sort by id, assuming ids have timestamps or we can just reverse since initial seed is chronological
    .slice(0, 10); // get top 10

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 relative">
      <LiveFeedRefresher />
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">
          Live Audit Feed
        </p>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>
      <AuditTimeline events={allEvents} />
    </section>
  );
}
