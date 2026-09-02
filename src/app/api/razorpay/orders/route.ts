import { createRazorpayTestOrder } from "@/lib/integrations";
import { findCase } from "@/lib/recovery-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { caseId?: string } | null;
  if (!body?.caseId) return Response.json({ error: "caseId is required." }, { status: 400 });
  const { recoveryCase } = await findCase(body.caseId);
  if (!recoveryCase) return Response.json({ error: "Recovery case not found." }, { status: 404 });
  const result = await createRazorpayTestOrder({
    amountPaise: recoveryCase.amountAtRisk * 100,
    receipt: `recoveryos-${recoveryCase.id}-${Date.now()}`.slice(0, 40),
    notes: { recovery_case: recoveryCase.id, synthetic: "true", recoveryos: "test-mode" },
  });
  if (!result.ok) return Response.json(result, { status: 503 });
  return Response.json(result);
}
