-- Enforce evidentiary and tenant invariants even when a privileged server key is used.
alter table public.consent_preferences
  add constraint consent_preferences_complete_categories
  check (
    categories ?& array['analytics', 'marketing', 'functional', 'personalization']
    and jsonb_typeof(categories->'analytics') = 'boolean'
    and jsonb_typeof(categories->'marketing') = 'boolean'
    and jsonb_typeof(categories->'functional') = 'boolean'
    and jsonb_typeof(categories->'personalization') = 'boolean'
  );

create or replace function public.verify_consent_preference_tenant()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1 from public.cookie_banners b
    where b.id = new.banner_id and b.company_id = new.company_id
  ) then
    raise exception 'banner must belong to the consent preference company';
  end if;

  if new.consent_id is not null and not exists (
    select 1 from public.consents c
    where c.id = new.consent_id and c.company_id = new.company_id
  ) then
    raise exception 'consent must belong to the consent preference company';
  end if;

  return new;
end;
$$;

drop trigger if exists consent_preferences_tenant_integrity on public.consent_preferences;
create trigger consent_preferences_tenant_integrity
before insert on public.consent_preferences
for each row execute function public.verify_consent_preference_tenant();
