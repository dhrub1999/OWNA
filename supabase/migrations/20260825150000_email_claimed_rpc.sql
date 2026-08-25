-- email_claimed
--
-- Closes a hole in the anonymous-to-real-account upgrade path
-- (upgradeAnonymousAccount, app/(auth)/actions.ts): supabase.auth.updateUser()
-- parks a not-yet-confirmed address in auth.users.email_change, not
-- auth.users.email, so the unique index on `email` never sees it and a second
-- signUp() (or a second updateUser() from a different anonymous session) with
-- the same address silently creates an unrelated second account instead of
-- being rejected. The first account's draft is then orphaned: its
-- confirmation link, when clicked, tries to move that address into `email`
-- and collides with the second account.
--
-- SECURITY DEFINER because it reads auth.users, which no API role can read.
-- The exposure is bounded and deliberate, same trade-off already made by
-- signInWithPassword's "email not confirmed" message: it confirms an address
-- has *some* account in progress, which is strictly less than what the
-- existing email_exists / user_already_exists signup errors already reveal.
-- Excludes the caller's own row so a signed-in caller re-checking an address
-- it has already (successfully) attached to itself doesn't get told its own
-- account is taken. auth.uid() resolves from the request JWT regardless of
-- SECURITY DEFINER, so this stays correct for anon (auth.uid() is null, never
-- matches) and authenticated callers alike.
create or replace function public.email_claimed(check_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from auth.users u
     where u.deleted_at is null
       and u.id is distinct from auth.uid()
       and (
         lower(u.email) = lower(btrim(check_email))
         or lower(u.email_change) = lower(btrim(check_email))
       )
  );
$$;

revoke execute on function public.email_claimed(text) from public;
grant  execute on function public.email_claimed(text) to anon, authenticated;

-- email_pending_confirmation
--
-- Narrower than email_claimed, and used for a different purpose: turning
-- signInWithPassword's generic "email and password don't match" into an
-- accurate "confirm your email" for the one case where that is provably true
-- rather than a guess. supabase.auth.signInWithPassword() looks a user up by
-- auth.users.email, so an address sitting only in email_change (an
-- unconfirmed updateUser() upgrade) can never succeed there no matter what
-- password is typed — GoTrue returns the same invalid_credentials it would
-- for a genuine typo. This function is true only when that is the situation:
-- the address is pending somewhere and is not yet any account's real,
-- sign-in-able email. If the address already has a confirmed (or
-- still-unconfirmed-but-signUp()'d) row in `email`, this returns false and
-- the caller falls back to the generic mismatch message, because a wrong
-- password there really is just a wrong password.
create or replace function public.email_pending_confirmation(check_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from auth.users u
     where u.deleted_at is null
       and lower(u.email_change) = lower(btrim(check_email))
  )
  and not exists (
    select 1 from auth.users u
     where u.deleted_at is null
       and lower(u.email) = lower(btrim(check_email))
  );
$$;

revoke execute on function public.email_pending_confirmation(text) from public;
grant  execute on function public.email_pending_confirmation(text) to anon, authenticated;
