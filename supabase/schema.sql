-- AccessiScan Supabase schema
-- Run in Supabase SQL Editor

-- Optional helper to auto-update updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- assessments table
create table if not exists public.assessments (
  id bigserial primary key,
  website_url text not null,
  email text,
  company_name text,
  assessment_results jsonb not null default '{}'::jsonb,
  overall_score integer not null default 0 check (overall_score between 0 and 100),
  total_issues integer not null default 0,
  critical_issues integer not null default 0,
  high_impact_issues integer not null default 0,
  medium_impact_issues integer not null default 0,
  low_impact_issues integer not null default 0,
  screenshot_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_assessments_created_at on public.assessments (created_at desc);
create index if not exists idx_assessments_overall_score on public.assessments (overall_score desc);
create index if not exists idx_assessments_results_gin on public.assessments using gin (assessment_results);

drop trigger if exists trg_assessments_updated_at on public.assessments;
create trigger trg_assessments_updated_at
before update on public.assessments
for each row execute function set_updated_at();

-- leads table
create table if not exists public.leads (
  id bigserial primary key,
  email text not null,
  company_name text not null,
  website_url text not null,
  assessment_id bigint references public.assessments(id) on delete set null,
  contact_preferences jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leads_email on public.leads (email);
create index if not exists idx_leads_created_at on public.leads (created_at desc);

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at
before update on public.leads
for each row execute function set_updated_at();

-- RLS (disabled by default since server-only access is used)
alter table public.assessments enable row level security;
alter table public.leads enable row level security;
-- Example policies (commented out):
-- create policy "server insert assessments" on public.assessments for insert to authenticated using (true) with check (true);
-- create policy "server read assessments" on public.assessments for select to authenticated using (true);
-- create policy "server insert leads" on public.leads for insert to authenticated using (true) with check (true);
-- create policy "server read leads" on public.leads for select to authenticated using (true);

