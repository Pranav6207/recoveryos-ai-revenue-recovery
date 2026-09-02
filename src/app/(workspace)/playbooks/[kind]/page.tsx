import { notFound } from "next/navigation";
import { loadWorkspace } from "@/lib/recovery-store";
import { CaseTable, PageTitle } from "@/components/workspace-server";
import { kindLabels } from "@/lib/recovery-data";
import { RecoveryKind, recoveryKinds } from "@/lib/recovery-types";
import { HinglishVoicePreview } from "@/components/hinglish-voice-preview";

export default async function PlaybookPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  
  if (!recoveryKinds.includes(kind as RecoveryKind)) {
    return notFound();
  }

  const workspace = await loadWorkspace();
  const cases = workspace.cases.filter((c) => c.kind === kind);

  return (
    <div className="space-y-6">
      <PageTitle 
        eyebrow="Playbook View" 
        title={kindLabels[kind as RecoveryKind]}
      />

      {kind === "hinglish_voice" && (
        <HinglishVoicePreview />
      )}

      <div className="mt-8">
        <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
          Cases in this Playbook ({cases.length})
        </h3>
        {cases.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
            <h3 className="font-semibold text-slate-900">No active cases</h3>
          </div>
        ) : (
          <CaseTable cases={cases} />
        )}
      </div>
    </div>
  );
}
