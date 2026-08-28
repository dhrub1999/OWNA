-- `authenticated` was missing INSERT/UPDATE table-level grants on `profiles`
-- and `profile_publications` (every other public table already has them).
-- This blocked writes before RLS was even evaluated, surfacing as a plain
-- "permission denied for table" error on publish rather than an RLS
-- violation. No migration ever revoked these explicitly, so this was set
-- outside migration history; restoring the grants here brings both tables
-- back in line with the rest of the schema and records it going forward.
grant insert, update on public.profiles to authenticated;
grant insert, update on public.profile_publications to authenticated;
