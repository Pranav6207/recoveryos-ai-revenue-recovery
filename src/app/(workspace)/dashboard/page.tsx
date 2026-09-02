import { PageTitle } from "@/components/workspace-server";

export default function DashboardPage() {
  return (
    <PageTitle eyebrow="Recovery Overview" title="Turn risk signals into recovered revenue.">
      <p className="max-w-md text-sm leading-6 text-slate-500 text-right">
        One agent, seven playbooks, evidence at every decision. Built for transparent recovery—not aggressive chasing.
      </p>
    </PageTitle>
  );
}
