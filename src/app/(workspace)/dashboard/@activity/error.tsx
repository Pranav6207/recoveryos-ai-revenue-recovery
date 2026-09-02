"use client";
export default function ActivityError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 flex flex-col items-center justify-center text-center">
      <h3 className="font-semibold text-rose-900">Failed to load activity feed</h3>
      <button onClick={reset} className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">Try again</button>
    </div>
  );
}
