import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { cookies } from "next/headers";

import { createSeedAudit, createSeedCases } from "./recovery-data";
import { getSupabaseAdmin } from "./integrations";
import type { AuditEvent, DemoRun, RecoveryCase } from "./recovery-types";

export const DEMO_RUN_COOKIE = "recoveryos_demo_run";
const RUN_LIFETIME_MS = 24 * 60 * 60 * 1000;

export type WorkspaceMetrics = {
  atRisk: number;
  recovered: number;
  recoveryRate: number;
  openCases: number;
  blockedCases: number;
  actionsTaken: number;
};

export type WorkspaceSnapshot = {
  run: DemoRun;
  cases: RecoveryCase[];
  audit: Record<string, AuditEvent[]>;
  metrics: WorkspaceMetrics;
};

type StoredRun = { id: string; expires_at: string };
type StoredCase = { case_code: string; payload: RecoveryCase };
type StoredAudit = { event: AuditEvent };

export function hashRunToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function fallbackRun(token?: string): DemoRun {
  return {
    id: `demo-${hashRunToken(token || "judge-fallback").slice(0, 12)}`,
    expiresAt: new Date(Date.now() + RUN_LIFETIME_MS).toISOString(),
    mode: "fallback",
  };
}

function makeMetrics(cases: RecoveryCase[], audit: Record<string, AuditEvent[]>): WorkspaceMetrics {
  const recovered = cases.reduce((sum, recoveryCase) => sum + recoveryCase.amountRecovered, 0);
  const atRisk = cases.reduce((sum, recoveryCase) => sum + recoveryCase.amountAtRisk, 0);
  const actionsTaken = Object.values(audit).flat().filter((event) => event.type === "action").length;
  return {
    atRisk,
    recovered,
    recoveryRate: atRisk ? Math.round((recovered / atRisk) * 100) : 0,
    openCases: cases.filter((recoveryCase) => !["recovered", "blocked"].includes(recoveryCase.status)).length,
    blockedCases: cases.filter((recoveryCase) => recoveryCase.status === "blocked").length,
    actionsTaken,
  };
}

function fallbackSnapshot(token?: string): WorkspaceSnapshot {
  const cases = createSeedCases();
  const audit = createSeedAudit(cases);
  return { run: fallbackRun(token), cases, audit, metrics: makeMetrics(cases, audit) };
}

async function currentToken() {
  return (await cookies()).get(DEMO_RUN_COOKIE)?.value;
}

export async function createPrivateDemoRun(token = randomUUID()): Promise<{ token: string; run: DemoRun }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { token, run: fallbackRun(token) };

  const expiresAt = new Date(Date.now() + RUN_LIFETIME_MS).toISOString();
  try {
    await supabase.from("demo_runs").delete().lt("expires_at", new Date().toISOString());
    const { data: run, error } = await supabase
      .from("demo_runs")
      .insert({ token_hash: hashRunToken(token), expires_at: expiresAt })
      .select("id, expires_at")
      .single<StoredRun>();
    if (error || !run) throw new Error(error?.message || "Unable to create demo run");

    const cases = createSeedCases();
    const { error: casesError } = await supabase.from("recovery_cases").insert(
      cases.map((recoveryCase) => ({ demo_run_id: run.id, case_code: recoveryCase.id, kind: recoveryCase.kind, status: recoveryCase.status, payload: recoveryCase })),
    );
    if (casesError) throw new Error(casesError.message);
    const audit = createSeedAudit(cases);
    const initialEvents = Object.values(audit).flat().map((event) => ({ demo_run_id: run.id, case_code: event.caseId, event }));
    const { error: auditError } = await supabase.from("recovery_audit_events").insert(initialEvents);
    if (auditError) throw new Error(auditError.message);
    return { token, run: { id: run.id, expiresAt: run.expires_at, mode: "supabase" } };
  } catch {
    return { token, run: fallbackRun(token) };
  }
}

export async function loadWorkspace(): Promise<WorkspaceSnapshot> {
  const token = await currentToken();
  const supabase = getSupabaseAdmin();
  if (!token || !supabase) return fallbackSnapshot(token);
  try {
    const { data: run } = await supabase
      .from("demo_runs")
      .select("id, expires_at")
      .eq("token_hash", hashRunToken(token))
      .gt("expires_at", new Date().toISOString())
      .maybeSingle<StoredRun>();
    if (!run) return fallbackSnapshot(token);
    const [casesResult, auditResult] = await Promise.all([
      supabase.from("recovery_cases").select("case_code, payload").eq("demo_run_id", run.id),
      supabase.from("recovery_audit_events").select("event").eq("demo_run_id", run.id).order("created_at", { ascending: true }),
    ]);
    if (casesResult.error || auditResult.error) throw new Error("Unable to load stored demo data");
    const cases = ((casesResult.data || []) as StoredCase[]).map((item) => item.payload).sort((a, b) => b.riskScore - a.riskScore);
    const audit = ((auditResult.data || []) as StoredAudit[]).reduce<Record<string, AuditEvent[]>>((accumulator, row) => {
      const events = accumulator[row.event.caseId] || [];
      events.push(row.event);
      accumulator[row.event.caseId] = events;
      return accumulator;
    }, {});
    return { run: { id: run.id, expiresAt: run.expires_at, mode: "supabase" }, cases, audit, metrics: makeMetrics(cases, audit) };
  } catch {
    return fallbackSnapshot(token);
  }
}

export async function findCase(caseCode: string) {
  const workspace = await loadWorkspace();
  return { workspace, recoveryCase: workspace.cases.find((item) => item.id === caseCode) || null };
}

export async function persistCaseUpdate(input: { workspace: WorkspaceSnapshot; recoveryCase: RecoveryCase; events: AuditEvent[]; action?: { mode: string; detail: string; providerReference?: string } }) {
  const supabase = getSupabaseAdmin();
  if (input.workspace.run.mode !== "supabase" || !supabase) return { persisted: false };
  const { error: updateError } = await supabase
    .from("recovery_cases")
    .update({ status: input.recoveryCase.status, payload: input.recoveryCase })
    .eq("demo_run_id", input.workspace.run.id)
    .eq("case_code", input.recoveryCase.id);
  if (updateError) throw new Error(updateError.message);
  if (input.events.length) {
    const { error: auditError } = await supabase.from("recovery_audit_events").insert(input.events.map((event) => ({ demo_run_id: input.workspace.run.id, case_code: event.caseId, event })));
    if (auditError) throw new Error(auditError.message);
  }
  if (input.action) {
    const { error: actionError } = await supabase.from("action_attempts").insert({
      demo_run_id: input.workspace.run.id,
      case_code: input.recoveryCase.id,
      adapter_mode: input.action.mode,
      detail: input.action.detail,
      provider_reference: input.action.providerReference || null,
    });
    if (actionError) throw new Error(actionError.message);
  }
  return { persisted: true };
}

export async function persistEmailAttempt(input: { workspace: WorkspaceSnapshot; caseCode: string; mode: string; reference: string; detail: string }) {
  const supabase = getSupabaseAdmin();
  if (input.workspace.run.mode !== "supabase" || !supabase) return;
  await supabase.from("email_deliveries").insert({ demo_run_id: input.workspace.run.id, case_code: input.caseCode, adapter_mode: input.mode, provider_reference: input.reference, detail: input.detail });
}
