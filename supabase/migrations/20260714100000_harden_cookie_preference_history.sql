-- Consent preference records are an append-only evidentiary ledger.
create or replace function public.prevent_consent_preference_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'consent_preferences is append-only';
end;
$$;

drop trigger if exists consent_preferences_immutable on public.consent_preferences;
create trigger consent_preferences_immutable
before update or delete on public.consent_preferences
for each row execute function public.prevent_consent_preference_mutation();

alter table public.consent_preferences
  add constraint consent_preferences_categories_object
  check (jsonb_typeof(categories) = 'object');

revoke update, delete on public.consent_preferences from anon, authenticated;
revoke insert, update, delete on public.consent_preferences from anon, authenticated;
