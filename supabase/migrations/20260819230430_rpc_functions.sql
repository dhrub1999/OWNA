-- Server-side operations that must not be expressible as a raw table write.
--
-- Everything here is SECURITY INVOKER unless it has to read a table the caller
-- deliberately has no access to. Where SECURITY DEFINER is unavoidable the
-- reason is stated inline, the search_path is pinned, and EXECUTE is revoked
-- from PUBLIC before being granted to the roles that actually need it
-- (Postgres grants EXECUTE to PUBLIC by default, which would otherwise make
-- every function in `public` an open API endpoint).

-- ---------------------------------------------------------------------------
-- Reserved usernames are enforced by a trigger, not by application code.
--
-- RLS lets a user insert their own profiles row with any username they like,
-- so checking the reserved list only inside claim_username() would be a check
-- anyone could route around by posting straight to the table.
-- ---------------------------------------------------------------------------

create or replace function private.reject_reserved_username()
returns trigger
language plpgsql
security definer            -- reads reserved_usernames, which no API role can read
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.reserved_usernames r where r.word = lower(new.username)
  ) then
    raise exception 'username "%" is reserved', new.username
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger profiles_reject_reserved_username
  before insert or update of username on public.profiles
  for each row execute function private.reject_reserved_username();

-- ---------------------------------------------------------------------------
-- username_available
--
-- SECURITY DEFINER because it reads reserved_usernames and profiles, neither of
-- which is readable by anon. The exposure is bounded and deliberate: it returns
-- a single boolean about a caller-supplied candidate, and usernames are public
-- URLs by design, so it reveals nothing that visiting the URL would not.
--
-- This is a convenience for the signup form, not a guarantee. The unique index
-- on profiles.username is what actually prevents two people claiming the same
-- name; callers must still handle a 23505 from claim_username.
-- ---------------------------------------------------------------------------

create or replace function public.username_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_valid_username(lower(btrim(candidate)))
     and not exists (
       select 1 from public.reserved_usernames r
        where r.word = lower(btrim(candidate))
     )
     and not exists (
       select 1 from public.profiles p
        where p.username = lower(btrim(candidate))
     );
$$;

revoke execute on function public.username_available(text) from public;
grant  execute on function public.username_available(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- claim_username — create the profile and its home page in one transaction
-- ---------------------------------------------------------------------------

create or replace function public.claim_username(p_username text)
returns public.profiles
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid     uuid := (select auth.uid());
  v_profile public.profiles;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if not public.username_available(p_username) then
    raise exception 'username "%" is not available', p_username
      using errcode = 'check_violation';
  end if;

  insert into public.profiles (user_id, username)
  values (v_uid, lower(btrim(p_username)))
  returning * into v_profile;

  insert into public.pages (profile_id, slug, title, is_home)
  values (v_profile.id, '', 'Home', true);

  return v_profile;
end;
$$;

revoke execute on function public.claim_username(text) from public;
grant  execute on function public.claim_username(text) to authenticated;

-- ---------------------------------------------------------------------------
-- publish_profile — build the public snapshot from the draft, server-side
--
-- The snapshot is assembled here rather than being posted by the client, so
-- there is no request in which a caller can publish content they do not own or
-- content that differs from their saved draft. RLS still applies: every read
-- and write below is scoped to the caller's own rows.
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

  -- Hidden blocks are dropped at publish time rather than filtered at render
  -- time, so a hidden block's content never reaches a public response at all.
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
    (profile_id, username, snapshot, visibility, is_live, version, published_at)
  values
    (v_profile.id, v_profile.username, v_snapshot, v_profile.visibility, true, 1, now())
  on conflict (profile_id) do update
    set username     = excluded.username,
        snapshot     = excluded.snapshot,
        visibility   = excluded.visibility,
        is_live      = true,
        version      = public.profile_publications.version + 1,
        published_at = now()
  returning * into v_row;

  update public.profiles set published_at = now() where id = v_profile.id;

  return v_row;
end;
$$;

revoke execute on function public.publish_profile() from public;
grant  execute on function public.publish_profile() to authenticated;

-- ---------------------------------------------------------------------------
-- unpublish_profile — take the public URL down without losing the snapshot,
-- so republishing is one click rather than a rebuild.
-- ---------------------------------------------------------------------------

create or replace function public.unpublish_profile()
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  update public.profile_publications pp
     set is_live = false
    from public.profiles p
   where p.id = pp.profile_id
     and p.user_id = v_uid;

  update public.profiles set published_at = null where user_id = v_uid;
end;
$$;

revoke execute on function public.unpublish_profile() from public;
grant  execute on function public.unpublish_profile() to authenticated;

-- ---------------------------------------------------------------------------
-- rename_username — keep the published row's denormalized username in step
--
-- profile_publications.username is a copy, and it is the column the public
-- route looks up. Letting the two drift would leave the old URL live and the
-- new one 404ing.
-- ---------------------------------------------------------------------------

create or replace function public.rename_username(p_username text)
returns public.profiles
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid     uuid := (select auth.uid());
  v_profile public.profiles;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if not public.username_available(p_username) then
    raise exception 'username "%" is not available', p_username
      using errcode = 'check_violation';
  end if;

  update public.profiles
     set username = lower(btrim(p_username))
   where user_id = v_uid
  returning * into v_profile;

  if not found then
    raise exception 'no profile' using errcode = '42501';
  end if;

  update public.profile_publications
     set username = v_profile.username,
         snapshot = jsonb_set(
                      snapshot,
                      '{profile,username}',
                      to_jsonb(v_profile.username)
                    )
   where profile_id = v_profile.id;

  return v_profile;
end;
$$;

revoke execute on function public.rename_username(text) from public;
grant  execute on function public.rename_username(text) to authenticated;
