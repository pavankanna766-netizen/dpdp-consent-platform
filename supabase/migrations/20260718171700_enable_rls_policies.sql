-- Enable Row Level Security (RLS) on all tables and configure policies

-- 1. Authentication helper to extract Clerk user ID from JWT claims
create or replace function public.current_user_clerk_id()
returns text
language sql stable security definer
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true)::json ->> 'sub', ''),
    ''
  );
$$;

-- 2. Organization membership check helper
create or replace function public.is_company_member(company_id uuid)
returns boolean
language plpgsql stable security definer
as $$
begin
  return exists (
    select 1 from public.company_members m
    where m.company_id = is_company_member.company_id
      and m.clerk_user_id = public.current_user_clerk_id()
  );
end;
$$;

-- 3. Scan owner verification helper (for detections and findings)
create or replace function public.is_scan_owner(scan_id uuid)
returns boolean
language plpgsql stable security definer
as $$
begin
  return exists (
    select 1 from public.scanner_scans s
    where s.id = is_scan_owner.scan_id
      and public.is_company_member(s.company_id)
  );
end;
$$;

-- 4. Enable RLS on all 16 tables
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.company_settings enable row level security;
alter table public.company_use_cases enable row level security;
alter table public.consents enable row level security;
alter table public.consent_templates enable row level security;
alter table public.consent_preferences enable row level security;
alter table public.audit_logs enable row level security;
alter table public.dsar_requests enable row level security;
alter table public.scanner_scans enable row level security;
alter table public.scanner_detections enable row level security;
alter table public.scanner_findings enable row level security;
alter table public.privacy_policies enable row level security;
alter table public.cookie_policies enable row level security;
alter table public.cookie_banners enable row level security;
alter table public.trust_centers enable row level security;

-- 5. Define RLS Policies for each table

-- Companies
create policy "Company members can read company"
  on public.companies for select
  using (public.is_company_member(id));

create policy "Company owners can update company"
  on public.companies for update
  using (exists (
    select 1 from public.company_members m
    where m.company_id = id
      and m.clerk_user_id = public.current_user_clerk_id()
      and m.role = 'owner'
  ));

-- Company Members
create policy "Members can view other members of their company"
  on public.company_members for select
  using (clerk_user_id = public.current_user_clerk_id() or public.is_company_member(company_id));

-- Company Settings
create policy "Company members can select settings"
  on public.company_settings for select
  using (public.is_company_member(company_id));

create policy "Company owners can modify settings"
  on public.company_settings for all
  using (exists (
    select 1 from public.company_members m
    where m.company_id = company_id
      and m.clerk_user_id = public.current_user_clerk_id()
      and m.role = 'owner'
  ));

-- Company Use Cases
create policy "Company members can read company use cases"
  on public.company_use_cases for select
  using (public.is_company_member(company_id));

create policy "Company owners can manage company use cases"
  on public.company_use_cases for all
  using (exists (
    select 1 from public.company_members m
    where m.company_id = company_id
      and m.clerk_user_id = public.current_user_clerk_id()
      and m.role = 'owner'
  ));

-- Consent Templates
create policy "Company members can manage templates"
  on public.consent_templates for all
  using (public.is_company_member(company_id));

create policy "Public can read published templates"
  on public.consent_templates for select
  using (status = 'published');

-- Consents
create policy "Company members can view consents"
  on public.consents for select
  using (public.is_company_member(company_id));

create policy "Public and SDK can insert consent records"
  on public.consents for insert
  with check (true);

-- Consent Preferences
create policy "Company members can view consent preferences"
  on public.consent_preferences for select
  using (public.is_company_member(company_id));

create policy "Public and SDK can insert consent preferences"
  on public.consent_preferences for insert
  with check (true);

create policy "Public and SDK can read visitor consent preferences"
  on public.consent_preferences for select
  using (true);

-- Audit Logs
create policy "Company members can read audit logs"
  on public.audit_logs for select
  using (public.is_company_member(company_id));

-- DSAR Requests
create policy "Company members can view and update DSAR requests"
  on public.dsar_requests for all
  using (public.is_company_member(company_id));

create policy "Public can submit DSAR requests"
  on public.dsar_requests for insert
  with check (true);

-- Scanner Scans
create policy "Company members can manage scans"
  on public.scanner_scans for all
  using (public.is_company_member(company_id));

-- Scanner Detections
create policy "Company members can view detections"
  on public.scanner_detections for select
  using (public.is_scan_owner(scan_id));

-- Scanner Findings
create policy "Company members can view findings"
  on public.scanner_findings for select
  using (public.is_scan_owner(scan_id));

-- Privacy Policies
create policy "Company members can manage privacy policies"
  on public.privacy_policies for all
  using (public.is_company_member(company_id));

create policy "Public can view published privacy policies"
  on public.privacy_policies for select
  using (status = 'published' and archived = false);

-- Cookie Policies
create policy "Company members can manage cookie policies"
  on public.cookie_policies for all
  using (public.is_company_member(company_id));

create policy "Public can view published cookie policies"
  on public.cookie_policies for select
  using (status = 'published');

-- Cookie Banners
create policy "Company members can manage cookie banners"
  on public.cookie_banners for all
  using (public.is_company_member(company_id));

create policy "Public can view published cookie banners"
  on public.cookie_banners for select
  using (status = 'published');

-- Trust Centers
create policy "Company members can manage trust centers"
  on public.trust_centers for all
  using (public.is_company_member(company_id));

create policy "Public can view public trust centers"
  on public.trust_centers for select
  using (true);
