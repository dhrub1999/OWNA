-- Row Level Security for every table in the exposed `public` schema.
--
-- Conventions used throughout, and the reason for each:
--   * `(select auth.uid())` rather than `auth.uid()` — Postgres hoists the
--     subquery into an InitPlan and evaluates it once per statement instead of
--     once per row.
--   * `to authenticated` / `to anon` rather than `auth.role()`, which is
--     deprecated and silently passes for anonymous sign-ins.
--   * every UPDATE policy carries both USING and WITH CHECK. Without WITH CHECK
--     a user can hand their row to somebody else by rewriting user_id.
--   * `to authenticated` on its own is authentication, not authorization. Every
--     policy below pairs it with an ownership predicate.

alter table public.profiles             enable row level security;
alter table public.pages                enable row level security;
alter table public.blocks               enable row level security;
alter table public.profile_publications enable row level security;
alter table public.assets               enable row level security;
alter table public.domains              enable row level security;
alter table public.reserved_usernames   enable row level security;

-- ---------------------------------------------------------------------------
-- Grants. RLS decides which rows are visible; grants decide whether the table
-- is reachable through the Data API at all. Both are required.
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.pages    to authenticated;
grant select, insert, update, delete on public.blocks   to authenticated;
grant select, insert, update, delete on public.assets   to authenticated;
grant select, insert, update, delete on public.profile_publications to authenticated;
grant select on public.profile_publications to anon;
grant select on public.domains to authenticated;

-- reserved_usernames is read only from inside a SECURITY DEFINER function.
-- No role gets direct access, and RLS with no policy denies everything anyway.

-- ---------------------------------------------------------------------------
-- profiles — owner only. Note there is deliberately no `anon` policy: the
-- public site never reads this table, it reads profile_publications.
-- ---------------------------------------------------------------------------

create policy "profiles_owner_select" on public.profiles
  for select to authenticated
  using ( (select auth.uid()) = user_id );

create policy "profiles_owner_insert" on public.profiles
  for insert to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "profiles_owner_update" on public.profiles
  for update to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "profiles_owner_delete" on public.profiles
  for delete to authenticated
  using ( (select auth.uid()) = user_id );

-- ---------------------------------------------------------------------------
-- pages — ownership walks up to profiles
-- ---------------------------------------------------------------------------

create policy "pages_owner_all" on public.pages
  for all to authenticated
  using (
    exists (
      select 1 from public.profiles p
       where p.id = pages.profile_id
         and p.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
       where p.id = pages.profile_id
         and p.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- blocks — ownership walks up through pages to profiles
-- ---------------------------------------------------------------------------

create policy "blocks_owner_all" on public.blocks
  for all to authenticated
  using (
    exists (
      select 1
        from public.pages pg
        join public.profiles p on p.id = pg.profile_id
       where pg.id = blocks.page_id
         and p.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
        from public.pages pg
        join public.profiles p on p.id = pg.profile_id
       where pg.id = blocks.page_id
         and p.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- profile_publications — the one table the world can read
-- ---------------------------------------------------------------------------

create policy "publications_public_read" on public.profile_publications
  for select to anon
  using ( is_live and visibility <> 'private' );

-- A signed-in visitor sees other people's live profiles, and always sees their
-- own — including while it is unpublished, which is what the dashboard needs.
create policy "publications_read" on public.profile_publications
  for select to authenticated
  using (
    (is_live and visibility <> 'private')
    or exists (
      select 1 from public.profiles p
       where p.id = profile_publications.profile_id
         and p.user_id = (select auth.uid())
    )
  );

create policy "publications_owner_write" on public.profile_publications
  for insert to authenticated
  with check (
    exists (
      select 1 from public.profiles p
       where p.id = profile_publications.profile_id
         and p.user_id = (select auth.uid())
    )
  );

create policy "publications_owner_update" on public.profile_publications
  for update to authenticated
  using (
    exists (
      select 1 from public.profiles p
       where p.id = profile_publications.profile_id
         and p.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
       where p.id = profile_publications.profile_id
         and p.user_id = (select auth.uid())
    )
  );

create policy "publications_owner_delete" on public.profile_publications
  for delete to authenticated
  using (
    exists (
      select 1 from public.profiles p
       where p.id = profile_publications.profile_id
         and p.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- assets — owner only
-- ---------------------------------------------------------------------------

create policy "assets_owner_select" on public.assets
  for select to authenticated
  using ( (select auth.uid()) = user_id );

create policy "assets_owner_insert" on public.assets
  for insert to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "assets_owner_update" on public.assets
  for update to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "assets_owner_delete" on public.assets
  for delete to authenticated
  using ( (select auth.uid()) = user_id );

-- ---------------------------------------------------------------------------
-- domains — read only for the owner until custom domains ship
-- ---------------------------------------------------------------------------

create policy "domains_owner_select" on public.domains
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
       where p.id = domains.profile_id
         and p.user_id = (select auth.uid())
    )
  );
