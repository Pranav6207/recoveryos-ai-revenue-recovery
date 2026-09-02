export default function OverviewLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-100 border border-slate-200" />
        ))}
      </div>
      <div className="h-48 rounded-2xl bg-slate-100 border border-slate-200" />
    </div>
  );
}
