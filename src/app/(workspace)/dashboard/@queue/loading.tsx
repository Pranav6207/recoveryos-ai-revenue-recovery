export default function QueueLoading() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-pulse">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="h-6 w-1/3 bg-slate-100 rounded mb-2" />
        <div className="h-4 w-1/4 bg-slate-50 rounded" />
      </div>
      <div className="p-5 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-full bg-slate-50 rounded" />
        ))}
      </div>
    </div>
  );
}
