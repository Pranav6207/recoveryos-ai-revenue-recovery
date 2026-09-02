"use client";

import dynamic from "next/dynamic";

const RecoveryChart = dynamic(() => import("./recovery-chart"), {
  ssr: false,
  loading: () => <div className="h-32 w-full animate-pulse rounded-xl bg-slate-100" />,
});

export function RecoveryChartWrapper() {
  return <RecoveryChart />;
}
