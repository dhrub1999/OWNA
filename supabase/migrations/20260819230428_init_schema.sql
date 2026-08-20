-- OWNA core schema.
--
-- Two halves that never mix:
--   * draft   -> profiles / pages / blocks, readable and writable only by the owner
--   * publish -> profile_publications, one denormalized JSONB snapshot per profile,
--                readable by the world. Rendering a public page reads exactly one row.

create schema if not exists private;
revoke all on schema private from public;
comment on schema private is
  'Internal helpers. Not exposed through the Data API; nothing here is callable by anon or authenticated.';

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Usernames are lowercase by construction; the regex below only admits
-- characters that are already lowercase, so normalising on write means the
-- unique index can never be defeated by casing.
create or replace function private.is_valid_username(candidate text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select candidate is not null
     and candidate ~ '^[a-z0-9](?:[a-z0-9_-]{1,28}[a-z0-9])?$';
$$;

create or replace function private.normalize_username()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.username := lower(btrim(new.username));
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- reserved_usernames
-- ---------------------------------------------------------------------------

create table public.reserved_usernames (
  word text primary key
);

comment on table public.reserved_usernames is
  'Names that can never be claimed, because a real route already uses them or will. Route precedence in the app is the first line of defence; this table is the second, and it is the one that stops a user claiming a name before we ship the route.';

insert into public.reserved_usernames (word) values
  ('_next'), ('about'), ('account'), ('admin'), ('api'), ('assets'), ('auth'),
  ('blog'), ('careers'), ('cdn'), ('changelog'), ('contact'), ('dashboard'),
  ('developer'), ('docs'), ('editor'), ('explore'), ('faq'), ('favicon'),
  ('feed'), ('help'), ('home'), ('image'), ('images'), ('index'), ('legal'),
  ('login'), ('logout'), ('mail'), ('me'), ('new'), ('news'), ('onboarding'),
  ('owna'), ('preview'), ('pricing'), ('privacy'), ('profile'), ('profiles'),
  ('public'), ('robots'), ('root'), ('rss'), ('search'), ('security'),
  ('settings'), ('signin'), ('signout'), ('signup'), ('sitemap'), ('static'),
  ('status'), ('support'), ('team'), ('terms'), ('u'), ('upload'), ('user'),
  ('users'), ('www');

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null unique references auth.users (id) on delete cascade,
  username       text not null,

  display_name   text,
  bio            text,
  avatar_url     text,
  status         text,
  location       text,

  seo_title       text,
  seo_description text,
  og_image_url    text,

  -- Draft appearance. Shape is owned by lib/themes/schema.ts; '{}' parses to
  -- the full default theme, so defaults live in exactly one place.
  theme  jsonb not null default '{}'::jsonb,
  layout jsonb not null default '{}'::jsonb,

  visibility   text not null default 'public'
                 check (visibility in ('public', 'unlisted', 'private')),
  published_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_username_format check (private.is_valid_username(username)),
  constraint profiles_bio_length check (bio is null or char_length(bio) <= 500),
  constraint profiles_display_name_length
    check (display_name is null or char_length(display_name) <= 80),
  constraint profiles_seo_title_length
    check (seo_title is null or char_length(seo_title) <= 120),
  constraint profiles_seo_description_length
    check (seo_description is null or char_length(seo_description) <= 300)
);

create unique index profiles_username_key on public.profiles (username);

create trigger profiles_normalize_username
  before insert or update of username on public.profiles
  for each row execute function private.normalize_username();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- pages
-- ---------------------------------------------------------------------------

create table public.pages (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  slug       text not null default '',
  title      text,
  is_home    boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, slug)
);

comment on table public.pages is
  'One row per profile in the MVP (the home page). The table exists so multi-page profiles are a UI change later rather than a migration.';

create index pages_profile_id_idx on public.pages (profile_id);
create unique index pages_one_home_per_profile
  on public.pages (profile_id) where is_home;

create trigger pages_set_updated_at
  before update on public.pages
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- blocks
-- ---------------------------------------------------------------------------

create table public.blocks (
  id       uuid primary key default gen_random_uuid(),
  page_id  uuid not null references public.pages (id) on delete cascade,
  type     text not null check (type in (
             'hero', 'text', 'social', 'links', 'projects',
             'image', 'gallery', 'embed', 'divider'
           )),
  -- Deliberately not unique. The editor holds the whole draft in memory and
  -- saves it as one document, so every position is rewritten together on each
  -- save; a unique constraint here — even a deferred one — would only make
  -- reordering harder without buying any integrity the save does not already
  -- guarantee.
  position   integer not null default 0,
  props      jsonb not null default '{}'::jsonb,
  style      jsonb not null default '{}'::jsonb,
  visible    boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blocks_page_position_idx on public.blocks (page_id, position, created_at);

create trigger blocks_set_updated_at
  before update on public.blocks
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- profile_publications
-- ---------------------------------------------------------------------------

create table public.profile_publications (
  profile_id   uuid primary key references public.profiles (id) on delete cascade,
  username     text not null,
  snapshot     jsonb not null,
  visibility   text not null default 'public'
                 check (visibility in ('public', 'unlisted', 'private')),
  is_live      boolean not null default true,
  version      integer not null default 1,
  published_at timestamptz not null default now()
);

comment on table public.profile_publications is
  'The published state of a profile, denormalized into one JSONB snapshot: profile fields, theme, layout, ordered visible blocks and SEO. Serving owna.com/{username} is a single indexed row read against this table.';

create unique index profile_publications_username_key
  on public.profile_publications (username);

-- Serving a public page filters on all three of these columns.
create index profile_publications_live_idx
  on public.profile_publications (username)
  where is_live and visibility <> 'private';

-- ---------------------------------------------------------------------------
-- assets
-- ---------------------------------------------------------------------------

create table public.assets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  bucket     text not null default 'profile-media',
  path       text not null,
  mime_type  text not null,
  size_bytes bigint not null check (size_bytes > 0),
  width      integer,
  height     integer,
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (bucket, path)
);

create index assets_user_id_created_idx on public.assets (user_id, created_at desc);

-- Conservative MVP limits, enforced where they cannot be bypassed. The client
-- also checks per-file size, but only for the error message.
create or replace function private.enforce_asset_quota()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  total_bytes bigint;
  total_files integer;
begin
  select coalesce(sum(a.size_bytes), 0), count(*)
    into total_bytes, total_files
    from public.assets a
   where a.user_id = new.user_id;

  if total_bytes + new.size_bytes > 52428800 then
    raise exception 'storage quota exceeded: 50 MB per account'
      using errcode = 'check_violation';
  end if;

  if total_files >= 40 then
    raise exception 'file count limit reached: 40 files per account'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger assets_enforce_quota
  before insert on public.assets
  for each row execute function private.enforce_asset_quota();

-- ---------------------------------------------------------------------------
-- domains (reserved for custom-domain support; intentionally unused in the MVP)
-- ---------------------------------------------------------------------------

create table public.domains (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  hostname    text not null unique,
  verified_at timestamptz,
  created_at  timestamptz not null default now()
);

create index domains_profile_id_idx on public.domains (profile_id);

comment on table public.domains is
  'Empty in the MVP. Present so that mapping a custom hostname to a profile_id is a lookup change in the renderer rather than a schema migration.';
