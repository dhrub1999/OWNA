-- Public profile directory (/discover).
--
-- Pre-launch, every published profile today is internal test data, and
-- nothing elsewhere in this schema distinguishes it from a future real one —
-- no `is_test` flag, no fixture registry. So a listing is a positive, manual
-- gate that starts empty for everyone, never a filter that tries to exclude
-- the bad ones: a profile appears in the directory only once BOTH its owner
-- has opted in AND an admin has explicitly approved it.

-- ---------------------------------------------------------------------------
-- profiles — owner-controlled opt-in/category, admin-controlled approval
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column directory_opt_in  boolean not null default false,
  add column directory_persona text
    check (directory_persona in ('consultant', 'photographer', 'freelancer', 'creative', 'jewellery')),
  add column directory_status  text not null default 'pending'
    check (directory_status in ('pending', 'approved', 'rejected'));

comment on column public.profiles.directory_opt_in is
  'Owner-controlled: "list me in the OWNA directory". Set from the editor''s Sharing panel.';
comment on column public.profiles.directory_persona is
  'Which /discover/{persona} category this profile belongs to. Seeded from the onboarding purpose, editable after.';
comment on column public.profiles.directory_status is
  'Admin-controlled only. See the column-level grant below and set_directory_status() — never grant authenticated UPDATE on this column directly.';

-- ---------------------------------------------------------------------------
-- profile_publications — the same three flags, denormalized at publish time.
--
-- The directory query reads this table only, exactly like every other public
-- read in this app (getPublishedProfile, getSitemapProfiles) — it must never
-- need a join back to profiles.
-- ---------------------------------------------------------------------------

alter table public.profile_publications
  add column directory_opt_in  boolean not null default false,
  add column directory_persona text
    check (directory_persona in ('consultant', 'photographer', 'freelancer', 'creative', 'jewellery')),
  add column directory_status  text not null default 'pending'
    check (directory_status in ('pending', 'approved', 'rejected'));

-- Matches the directory query's exact filter, so it's an index-only lookup
-- rather than a filtered scan.
create index profile_publications_directory_idx
  on public.profile_publications (directory_persona, published_at desc)
  where is_live and visibility = 'public' and directory_opt_in and directory_status = 'approved';

-- ---------------------------------------------------------------------------
-- publish_profile() — now carries the three flags from the draft row into
-- the published row, the same way it already carries `visibility`.
-- ---------------------------------------------------------------------------

create or replace function public.publish_profile()
returns public.profile_publications
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid      uuid := (select auth.uid());
  v_profile  public.profiles;
  v_page_id  uuid;
  v_blocks   jsonb;
  v_snapshot jsonb;
  v_row      public.profile_publications;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select * into v_profile
    from public.profiles
   where user_id = v_uid;

  if not found then
    raise exception 'no profile to publish' using errcode = '42501';
  end if;

  select id into v_page_id
    from public.pages
   where profile_id = v_profile.id and is_home
   limit 1;

  select coalesce(
           jsonb_agg(
             jsonb_build_object(
               'id',    b.id,
               'type',  b.type,
               'props', b.props,
               'style', b.style
             )
             order by b.position, b.created_at
           ),
           '[]'::jsonb
         )
    into v_blocks
    from public.blocks b
   where b.page_id = v_page_id
     and b.visible;

  v_snapshot := jsonb_build_object(
    'version', 1,
    'profile', jsonb_build_object(
      'username',    v_profile.username,
      'displayName', v_profile.display_name,
      'bio',         v_profile.bio,
      'avatarUrl',   v_profile.avatar_url,
      'status',      v_profile.status,
      'location',    v_profile.location
    ),
    'seo', jsonb_build_object(
      'title',       v_profile.seo_title,
      'description', v_profile.seo_description,
      'ogImageUrl',  v_profile.og_image_url
    ),
    'theme',       v_profile.theme,
    'layout',      v_profile.layout,
    'blocks',      v_blocks,
    'publishedAt', to_jsonb(now())
  );

  insert into public.profile_publications
    (profile_id, username, snapshot, visibility, is_live, version, published_at,
     directory_opt_in, directory_persona, directory_status)
  values
    (v_profile.id, v_profile.username, v_snapshot, v_profile.visibility, true, 1, now(),
     v_profile.directory_opt_in, v_profile.directory_persona, v_profile.directory_status)
  on conflict (profile_id) do update
    set username          = excluded.username,
        snapshot           = excluded.snapshot,
        visibility         = excluded.visibility,
        is_live            = true,
        version            = public.profile_publications.version + 1,
        published_at       = now(),
        directory_opt_in   = excluded.directory_opt_in,
        directory_persona  = excluded.directory_persona,
        directory_status   = excluded.directory_status
  returning * into v_row;

  update public.profiles set published_at = now() where id = v_profile.id;

  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- Column-level write boundary.
--
-- RLS is row-level only — `profiles_owner_update` and `publications_owner_*`
-- let an owner touch any column of their own row, and the existing grants
-- are table-wide. Left alone, any signed-in owner could set their own
-- directory_status = 'approved' directly through the Data API on EITHER
-- table (the directory query reads profile_publications, so both had to be
-- closed, not just profiles) — which breaks this app's own stated invariant
-- that nothing trusts the client. Column-level grants close that without
-- touching RLS.
-- ---------------------------------------------------------------------------

revoke insert, update on public.profiles from authenticated;

-- Exactly the columns app code writes directly today (saveDraft in
-- app/(app)/actions.ts, completeOnboarding in
-- app/onboarding/questionnaire/actions.ts) plus the columns the
-- security-invoker RPCs above write on the caller's behalf (published_at,
-- username). directory_status is deliberately absent — see
-- set_directory_status() below.
grant insert (user_id, username) on public.profiles to authenticated;

grant update (
  username, display_name, bio, avatar_url, status, location,
  seo_title, seo_description, og_image_url, theme, layout, visibility,
  published_at, directory_opt_in, directory_persona
) on public.profiles to authenticated;

revoke insert, update on public.profile_publications from authenticated;

-- Exactly the columns publish_profile(), unpublish_profile() and
-- rename_username() write on the caller's behalf. No app code writes this
-- table directly — every write goes through one of those three RPCs.
-- directory_status is deliberately absent here too.
grant insert (
  profile_id, username, snapshot, visibility, is_live, version, published_at,
  directory_opt_in, directory_persona
) on public.profile_publications to authenticated;

grant update (
  username, snapshot, visibility, is_live, version, published_at,
  directory_opt_in, directory_persona
) on public.profile_publications to authenticated;

-- ---------------------------------------------------------------------------
-- Admin allowlist and the one function allowed to write directory_status.
--
-- No admin role or table exists anywhere else in this schema, and a
-- launch-scale approval queue doesn't need one: private.directory_admins is a
-- plain table, empty until a row is inserted into it by hand through the
-- Supabase SQL editor. It starts — and stays, until that happens — completely
-- empty, so set_directory_status() rejects every caller and the directory is
-- provably unlistable by anyone, including today's test profiles, until
-- someone with database access deliberately grants a specific account
-- approval rights.
--
-- To make an account an admin once a real (non-anonymous) one exists:
--   insert into private.directory_admins (user_id) values ('<their auth.uid()>');
-- ---------------------------------------------------------------------------

create table private.directory_admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

comment on table private.directory_admins is
  'Accounts allowed to call set_directory_status(). Populated by hand via the SQL editor — empty by default, deliberately.';

alter table private.directory_admins enable row level security;
-- No policies: schema `private` already has `revoke all ... from public`
-- (see the init migration), so this table is unreachable through the Data
-- API regardless. RLS is enabled anyway as a second, independent line of
-- defense.

create or replace function public.set_directory_status(p_profile_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from private.directory_admins where user_id = (select auth.uid())
  ) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if p_status not in ('pending', 'approved', 'rejected') then
    raise exception 'invalid status: %', p_status using errcode = '22023';
  end if;

  update public.profiles
     set directory_status = p_status
   where id = p_profile_id;

  -- Approval shouldn't wait on the owner republishing, so this writes the
  -- published row directly too, exactly like unpublish_profile() already
  -- writes is_live independent of a full republish.
  update public.profile_publications
     set directory_status = p_status
   where profile_id = p_profile_id;
end;
$$;

revoke execute on function public.set_directory_status(uuid, text) from public;
grant  execute on function public.set_directory_status(uuid, text) to authenticated;
