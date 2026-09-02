import type { ReactNode } from "react";

export default function DashboardLayout({
  children,
  overview,
  queue,
  activity,
}: {
  children: ReactNode;
  overview: ReactNode;
  queue: ReactNode;
  activity: ReactNode;
}) {
  return (
    <div className="space-y-8">
      {children}
      {overview}
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.5fr)_minmax(390px,.8fr)]">
        <div className="min-w-0">
          {queue}
        </div>
        <aside className="min-w-0">
          {activity}
        </aside>
      </div>
    </div>
  );
}
