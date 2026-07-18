-- =========================================================================
-- CREATE VENDOR REGISTRY & DATA INVENTORY TABLES
-- =========================================================================

-- 1. Create Vendor Registry Table
create table if not exists public.vendor_registry (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  data_categories text[] not null,
  purpose text not null,
  agreement_clears_safeguard_bar boolean not null default false,
  renewal_status text not null default 'Active',
  contract_expiry timestamptz,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security on vendor registry
alter table public.vendor_registry enable row level security;

-- 2. Create Data Inventory Table
create table if not exists public.data_inventory (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  category text not null,
  data_subject text not null,
  purpose text not null,
  data_types text[] not null,
  shared_with_processor text,
  legal_basis text not null,
  retention_period text not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security on data inventory
alter table public.data_inventory enable row level security;


-- =========================================================================
-- RLS POLICIES FOR SECURE CLIENT-SIDE OPERATION
-- =========================================================================

-- Vendor Registry Policies
create policy "Company members can read vendor registry"
  on public.vendor_registry for select using (public.is_company_member(company_id));

create policy "Company members can manage vendor registry"
  on public.vendor_registry for all using (public.is_company_member(company_id));

-- Data Inventory Policies
create policy "Company members can read data inventory"
  on public.data_inventory for select using (public.is_company_member(company_id));

create policy "Company members can manage data inventory"
  on public.data_inventory for all using (public.is_company_member(company_id));
