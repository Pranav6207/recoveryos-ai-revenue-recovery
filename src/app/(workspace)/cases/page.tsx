import { loadWorkspace } from "@/lib/recovery-store";
import { CaseTable, PageTitle } from "@/components/workspace-server";
import { CaseFilters } from "@/components/case-filters";
import { RecoveryKind, CaseStatus } from "@/lib/recovery-types";

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const workspace = await loadWorkspace();
  const params = await searchParams;
  
  const kindFilter = typeof params.kind === "string" ? params.kind as RecoveryKind : undefined;
  const statusFilter = typeof params.status === "string" ? params.status as CaseStatus : undefined;

  let cases = workspace.cases;

  if (kindFilter) {
    cases = cases.filter(c => c.kind === kindFilter);
  }
  if (statusFilter) {
    cases = cases.filter(c => c.status === statusFilter);
  }

  return (
    <div className="space-y-6">
      <PageTitle 
        eyebrow="Cases & Evidence" 
        title="Recovery Command Queue"
      >
        <p className="max-w-md text-sm leading-6 text-slate-500 text-right">
          Full 120-event synthetic batch. All actions require deterministic policy approval.
        </p>
      </PageTitle>

      <CaseFilters />
      
      {cases.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
          <h3 className="font-semibold text-slate-900">No cases found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <CaseTable cases={cases} />
      )}
    </div>
  );
}
