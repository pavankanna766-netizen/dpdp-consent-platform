-- Supabase Rate Limiter and Idempotency Infrastructure Migration

-- 1. Create Rate Limit Buckets Table
create table if not exists public.rate_limit_buckets (
  key text primary key,
  tokens float not null,
  last_updated timestamptz not null
);

-- Enable RLS on rate limit buckets
alter table public.rate_limit_buckets enable row level security;

-- Revoke all direct public permissions
revoke all on public.rate_limit_buckets from anon, authenticated;

-- 2. Create consume_rate_limit_token stored procedure
create or replace function public.consume_rate_limit_token(
  p_key text,
  p_limit int,
  p_window_ms int
) returns table (
  allowed boolean,
  remaining int,
  reset_at bigint
)
language plpgsql
security definer
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_tokens float;
  v_last_updated timestamptz;
  v_fill_rate float;
  v_new_tokens float;
  v_window_seconds float := p_window_ms::float / 1000.0;
begin
  -- Fill rate is tokens per second
  v_fill_rate := p_limit::float / v_window_seconds;

  -- Select or insert the bucket
  insert into public.rate_limit_buckets (key, tokens, last_updated)
  values (p_key, p_limit::float, v_now)
  on conflict (key) do nothing;

  -- Lock the row for update to ensure transaction safety
  select tokens, last_updated
  into v_tokens, v_last_updated
  from public.rate_limit_buckets
  where key = p_key
  for update;

  -- Calculate replenished tokens based on elapsed time
  v_new_tokens := least(
    p_limit::float,
    v_tokens + (extract(epoch from (v_now - v_last_updated)) * v_fill_rate)
  );

  if v_new_tokens >= 1.0 then
    allowed := true;
    remaining := floor(v_new_tokens - 1.0)::int;
    update public.rate_limit_buckets
    set tokens = v_new_tokens - 1.0,
        last_updated = v_now
    where key = p_key;
  else
    allowed := false;
    remaining := floor(v_new_tokens)::int;
    update public.rate_limit_buckets
    set tokens = v_new_tokens,
        last_updated = v_now
    where key = p_key;
  end if;

  -- Reset timestamp in ms
  reset_at := extract(epoch from v_now)::bigint * 1000 + p_window_ms;
  return next;
end;
$$;

-- 3. Create Idempotency Keys Table
create table if not exists public.idempotency_keys (
  key text primary key,
  response jsonb,
  expires_at timestamptz not null
);

-- Enable RLS on idempotency keys
alter table public.idempotency_keys enable row level security;

-- Revoke all direct public permissions
revoke all on public.idempotency_keys from anon, authenticated;

-- 4. Database-backed Statistics Counting Functions (Scales to millions)
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
  select count(*)::int into v_total
  from public.consents
  where company_id = p_company_id;

  select count(*)::int into v_granted
  from public.consents
  where company_id = p_company_id and status = 'granted';

  select count(*)::int into v_withdrawn
  from public.consents
  where company_id = p_company_id and status = 'withdrawn';

  return json_build_object(
    'total', v_total,
    'granted', v_granted,
    'withdrawn', v_withdrawn
  );
end;
$$;

