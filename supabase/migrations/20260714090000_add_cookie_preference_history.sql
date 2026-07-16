create table if not exists public.consent_preferences (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  banner_id uuid not null references public.cookie_banners(id) on delete restrict,
  consent_id uuid references public.consents(id) on delete restrict,
  subject_identifier text not null,
  decision text not null check (decision in ('accepted', 'rejected', 'saved', 'withdrawn')),
  categories jsonb not null,
  banner_version integer not null check (banner_version > 0),
  privacy_policy_version integer,
  cookie_policy_version integer,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists consent_preferences_subject_lookup_idx
  on public.consent_preferences (company_id, banner_id, subject_identifier, created_at desc);

create index if not exists consent_preferences_consent_id_idx
  on public.consent_preferences (consent_id)
  where consent_id is not null;

alter table public.consent_preferences enable row level security;

-- Preference records are written exclusively through tenant-aware server routes.
-- No client role receives direct table access.
