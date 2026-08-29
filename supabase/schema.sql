-- Optional cloud persistence for a configured Supabase project.
-- The public demo works without this table or any credentials.
create table if not exists public.recovery_audit_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  run_id text not null,
  case_id text not null,
  event_type text not null,
  title text not null,
  detail text not null,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.recovery_audit_events enable row level security;

-- All writes are server-side through a service-role key. Public anonymous access is intentionally denied.
revoke all on table public.recovery_audit_events from anon, authenticated;
