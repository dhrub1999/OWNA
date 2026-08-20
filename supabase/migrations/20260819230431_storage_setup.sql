-- Storage for avatars, gallery images, project covers and backgrounds.
--
-- Objects are keyed `{user_id}/{uuid}.{ext}`. The leading folder is the
-- ownership check: a user may only write under a prefix equal to their own uid,
-- which is what makes direct browser uploads safe without a service-role key
-- anywhere in the codebase.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-media',
  'profile-media',
  true,
  5242880,  -- 5 MB per object; the per-account quota lives on public.assets
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Published profiles are served to anonymous visitors, so reads are open.
-- Nothing private is ever placed in this bucket.
create policy "profile_media_read" on storage.objects
  for select to anon, authenticated
  using ( bucket_id = 'profile-media' );

-- Upsert needs INSERT, SELECT and UPDATE together. Granting INSERT alone lets
-- new uploads through but makes replacing a file fail silently.
create policy "profile_media_owner_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'profile-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "profile_media_owner_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'profile-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'profile-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "profile_media_owner_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'profile-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
