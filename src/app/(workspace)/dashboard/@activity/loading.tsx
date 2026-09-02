export default function ActivityLoading() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 animate-pulse">
      <div className="h-4 w-1/3 bg-slate-100 rounded mb-5" />
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-8 w-8 rounded-full bg-slate-100" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-3/4 bg-slate-50 rounded" />
              <div className="h-3 w-1/2 bg-slate-50 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
