"use client";
export default function QueueError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 flex flex-col items-center justify-center text-center">
      <h3 className="font-semibold text-rose-900">Failed to load queue</h3>
      <p className="text-sm text-rose-700 mt-1 mb-4">{error.message}</p>
      <button onClick={reset} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">Try again</button>
    </div>
  );
}
