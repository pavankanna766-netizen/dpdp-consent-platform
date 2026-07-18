-- 1. Alter legal tables to add reviewed_by_counsel
alter table public.privacy_policies add column if not exists reviewed_by_counsel boolean not null default false;
alter table public.cookie_policies add column if not exists reviewed_by_counsel boolean not null default false;

-- 2. Alter registries to add unconfirmed status
alter table public.vendor_registry add column if not exists unconfirmed boolean not null default true;
alter table public.data_inventory add column if not exists unconfirmed boolean not null default true;

-- 3. Alter audit_logs to support cryptographic hash chaining
alter table public.audit_logs add column if not exists previous_entry_hash text;
alter table public.audit_logs add column if not exists entry_hash text;

-- 4. Immutability trigger for audit_logs
create or replace function public.prevent_audit_log_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_logs table is append-only and immutable';
end;
$$;

drop trigger if exists audit_logs_immutable on public.audit_logs;
create trigger audit_logs_immutable
before update or delete on public.audit_logs
for each row execute function public.prevent_audit_log_mutation();

-- 5. Create Breach Incidents Table
create table if not exists public.breach_incidents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  breach_type text not null,
  affected_users int not null,
  data_categories text not null,
  description text,
  notification_deadline timestamptz not null,
  created_at timestamptz not null default now()
);

-- Enable RLS on breach_incidents
alter table public.breach_incidents enable row level security;
drop policy if exists "Company members can manage breach_incidents" on public.breach_incidents;
create policy "Company members can manage breach_incidents"
  on public.breach_incidents for all using (public.is_company_member(company_id));
