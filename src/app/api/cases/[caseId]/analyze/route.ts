import { diagnoseCase } from "@/lib/recovery-ai";
import { findCase, persistCaseUpdate } from "@/lib/recovery-store";
import type { AuditEvent } from "@/lib/recovery-types";

export const runtime = "nodejs";

export async function POST(_request: Request, context: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await context.params;
  const { workspace, recoveryCase } = await findCase(caseId);
  if (!recoveryCase) return Response.json({ error: "Recovery case not found." }, { status: 404 });

  const diagnosis = await diagnoseCase(recoveryCase);
  const event: AuditEvent = {
    id: `${recoveryCase.id}-diagnosis-${Date.now()}`,
    caseId: recoveryCase.id,
    time: "Just now",
    title: diagnosis.mode === "live_test" ? "Gemini diagnosis completed" : "AI fallback activated",
    detail: diagnosis.mode === "live_test" ? diagnosis.riskSummary : "Gemini was unavailable or not configured; deterministic diagnosis supplied.",
    type: "ai",
    adapterMode: diagnosis.mode,
  };
  await persistCaseUpdate({ workspace, recoveryCase, events: [event] });
  return Response.json({ diagnosis, event, persisted: workspace.run.mode === "supabase" });
}
