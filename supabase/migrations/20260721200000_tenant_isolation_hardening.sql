-- 1. Harden SECURITY DEFINER functions

create or replace function public.get_audit_stats(p_company_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_total int;
  v_today int;
  v_event_types int;
begin
  -- Authorization check: caller must be a company member
  if not public.is_company_member(p_company_id) then
    return json_build_object('total', 0, 'today', 0, 'eventTypes', 0);
  end if;

  select count(*)::int into v_total
  from public.audit_logs
  where company_id = p_company_id;

  select count(*)::int into v_today
  from public.audit_logs
  where company_id = p_company_id
    and created_at >= date_trunc('day', clock_timestamp());

  select count(distinct event_type)::int into v_event_types
  from public.audit_logs
  where company_id = p_company_id;

  return json_build_object(
    'total', v_total,
    'today', v_today,
    'eventTypes', v_event_types
  );
end;
$$;

create or replace function public.get_consent_stats(p_company_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_total int;
  v_granted int;
  v_withdrawn int;
begin
  -- Authorization check: caller must be a company member
  if not public.is_company_member(p_company_id) then
    return json_build_object('total', 0, 'granted', 0, 'withdrawn', 0);
  end if;

  select count(*)::int into v_total
  from public.consents
  where company_id = p_company_id;

  select count(*)::int into v_granted
  from public.consents
  where company_id = p_company_id
    and status = 'granted';

  select count(*)::int into v_withdrawn
  from public.consents
  where company_id = p_company_id
    and status = 'withdrawn';

  return json_build_object(
    'total', v_total,
    'granted', v_granted,
    'withdrawn', v_withdrawn
  );
end;
$$;

-- 2. Revoke EXECUTE on sensitive functions from public roles
revoke execute on function public.get_audit_stats(uuid) from anon, authenticated;
revoke execute on function public.get_consent_stats(uuid) from anon, authenticated;

-- 3. Fix dangerous public INSERT RLS policies

-- Consents: replace open insert
drop policy if exists "Public and SDK can insert consent records" on public.consents;
create policy "Insert consents with valid company"
  on public.consents for insert
  with check (
    exists (select 1 from public.companies c where c.id = company_id)
    and exists (select 1 from public.consent_templates t where t.id = template_id and t.company_id = company_id and t.status = 'published')
  );

-- DSAR Requests: replace open insert  
drop policy if exists "Public can submit DSAR requests" on public.dsar_requests;
create policy "Insert DSAR with valid company"
  on public.dsar_requests for insert
  with check (
    exists (select 1 from public.companies c where c.id = company_id)
  );

-- 4. Add tenant validation triggers as defense-in-depth

-- Consent insert validation trigger
create or replace function public.verify_consent_tenant()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1 from public.consent_templates t
    where t.id = new.template_id
      and t.company_id = new.company_id
  ) then
    raise exception 'consent template must belong to the specified company';
  end if;
  return new;
end;
$$;

drop trigger if exists consent_tenant_integrity on public.consents;
create trigger consent_tenant_integrity
before insert on public.consents
for each row execute function public.verify_consent_tenant();

-- DSAR insert validation trigger
create or replace function public.verify_dsar_tenant()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1 from public.companies c
    where c.id = new.company_id
  ) then
    raise exception 'company_id must reference a valid company';
  end if;
  return new;
end;
$$;

drop trigger if exists dsar_tenant_integrity on public.dsar_requests;
create trigger dsar_tenant_integrity
before insert on public.dsar_requests
for each row execute function public.verify_dsar_tenant();

-- 5. Fix audit_logs insert policy (currently missing — only SELECT policy exists)
revoke insert, update, delete on public.audit_logs from anon, authenticated;

-- 6. Fix billing_transactions insert policy (currently only SELECT exists)
revoke insert, update, delete on public.billing_transactions from anon, authenticated;

-- 7. Fix breach_incidents — restrict INSERT to service role only
revoke insert, update, delete on public.breach_incidents from anon;
