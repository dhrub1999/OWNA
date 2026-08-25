-- Feedback collected from the "You're live" first-publish moment.
--
-- Write-only from the client's perspective: authenticated users may insert
-- their own row but never read, update or delete it back. Nothing here trusts
-- the client for identity or the profile name — both are stamped by the
-- Server Action from the caller's own session and profile row, same as every
-- other mutation in this codebase.

create table public.feedback (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  profile_name text,
  message      text not null,
  heard_about  text,
  created_at   timestamptz not null default now(),

  constraint feedback_message_length check (char_length(message) between 1 and 2000),
  constraint feedback_profile_name_length check (profile_name is null or char_length(profile_name) <= 80),
  constraint feedback_heard_about check (heard_about is null or heard_about in (
    'twitter', 'instagram', 'tiktok', 'youtube', 'google', 'friend', 'other'
  ))
);

alter table public.feedback enable row level security;

grant insert on public.feedback to authenticated;

create policy "feedback_owner_insert" on public.feedback
  for insert to authenticated
  with check ( (select auth.uid()) = user_id );
