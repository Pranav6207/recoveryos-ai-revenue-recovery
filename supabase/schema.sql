-- RecoveryOS is server-only. Do not add browser SELECT/INSERT policies to these tables.
create extension if not exists pgcrypto;

create table if not exists public.demo_runs (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.recovery_cases (
  id uuid primary key default gen_random_uuid(),
  demo_run_id uuid not null references public.demo_runs(id) on delete cascade,
  case_code text not null,
  kind text not null,
  status text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (demo_run_id, case_code)
);

create table if not exists public.recovery_audit_events (
  id uuid primary key default gen_random_uuid(),
  demo_run_id uuid not null references public.demo_runs(id) on delete cascade,
  case_code text not null,
  event jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.action_attempts (
  id uuid primary key default gen_random_uuid(),
  demo_run_id uuid not null references public.demo_runs(id) on delete cascade,
  case_code text not null,
  adapter_mode text not null check (adapter_mode in ('live_test', 'simulated', 'fallback', 'blocked')),
  provider_reference text,
  detail text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.email_deliveries (
  id uuid primary key default gen_random_uuid(),
  demo_run_id uuid not null references public.demo_runs(id) on delete cascade,
  case_code text not null,
  adapter_mode text not null check (adapter_mode in ('live_test', 'simulated', 'fallback', 'blocked')),
  provider_reference text,
  detail text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_artifacts (
  id uuid primary key default gen_random_uuid(),
  demo_run_id uuid references public.demo_runs(id) on delete cascade,
  case_code text,
  provider text not null default 'razorpay',
  provider_reference text not null,
  kind text not null,
  state text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (provider, provider_reference)
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create index if not exists recovery_cases_run_idx on public.recovery_cases (demo_run_id, case_code);
create index if not exists recovery_audit_events_run_idx on public.recovery_audit_events (demo_run_id, created_at);
create index if not exists demo_runs_expiry_idx on public.demo_runs (expires_at);

alter table public.demo_runs enable row level security;
alter table public.recovery_cases enable row level security;
alter table public.recovery_audit_events enable row level security;
alter table public.action_attempts enable row level security;
alter table public.email_deliveries enable row level security;
alter table public.payment_artifacts enable row level security;
alter table public.webhook_events enable row level security;

revoke all on public.demo_runs, public.recovery_cases, public.recovery_audit_events,
  public.action_attempts, public.email_deliveries, public.payment_artifacts,
  public.webhook_events from anon, authenticated;
