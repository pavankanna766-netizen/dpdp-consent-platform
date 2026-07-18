-- 1. Create data_inventory_vendors join table to relate Data Inventory to Vendor Registry
create table if not exists public.data_inventory_vendors (
  data_inventory_id uuid not null references public.data_inventory(id) on delete cascade,
  vendor_id uuid not null references public.vendor_registry(id) on delete cascade,
  primary key (data_inventory_id, vendor_id)
);

-- Enable RLS on the join table
alter table public.data_inventory_vendors enable row level security;
drop policy if exists "Company members can manage data_inventory_vendors" on public.data_inventory_vendors;
create policy "Company members can manage data_inventory_vendors"
  on public.data_inventory_vendors for all using (
    exists (
      select 1 from public.data_inventory i
      where i.id = data_inventory_id and public.is_company_member(i.company_id)
    )
  );

-- 2. Alter privacy_policies and cookie_policies to add CHECK constraints enforcing reviewed_by_counsel
alter table public.privacy_policies drop constraint if exists chk_privacy_policy_counsel;
alter table public.privacy_policies add constraint chk_privacy_policy_counsel check (status <> 'published' or reviewed_by_counsel = true);

alter table public.cookie_policies drop constraint if exists chk_cookie_policy_counsel;
alter table public.cookie_policies add constraint chk_cookie_policy_counsel check (status <> 'published' or reviewed_by_counsel = true);

-- 3. Alter breach_incidents to track dual countdown deadlines and notified timestamps
alter table public.breach_incidents drop column if exists notification_deadline;
alter table public.breach_incidents add column if not exists certin_deadline timestamptz not null;
alter table public.breach_incidents add column if not exists dpbi_deadline timestamptz not null;
alter table public.breach_incidents add column if not exists certin_notified_at timestamptz;
alter table public.breach_incidents add column if not exists dpbi_notified_at timestamptz;

-- 4. Alter dsar_requests to support SLA due date column
alter table public.dsar_requests add column if not exists sla_due_date timestamptz;
