-- In-progress questionnaire answers for the pre-account onboarding flow.
--
-- A visitor is signed in anonymously (supabase.auth.signInAnonymously()) before
-- they ever see the questionnaire, so auth.uid() already identifies them. This
-- table exists purely so an accidental reload mid-questionnaire does not lose
-- progress; the row is deleted once onboarding finishes and the answers have
-- been turned into a real profile via claim_username + a seeded draft.

create table public.onboarding_answers (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  answers    jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger onboarding_answers_set_updated_at
  before update on public.onboarding_answers
  for each row execute function private.set_updated_at();

alter table public.onboarding_answers enable row level security;

grant select, insert, update, delete on public.onboarding_answers to authenticated;

create policy "onboarding_answers_owner_select" on public.onboarding_answers
  for select to authenticated
  using ( (select auth.uid()) = user_id );

create policy "onboarding_answers_owner_insert" on public.onboarding_answers
  for insert to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "onboarding_answers_owner_update" on public.onboarding_answers
  for update to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "onboarding_answers_owner_delete" on public.onboarding_answers
  for delete to authenticated
  using ( (select auth.uid()) = user_id );
