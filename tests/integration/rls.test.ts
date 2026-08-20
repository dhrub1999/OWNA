import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/types/database";

/**
 * Row Level Security, verified against a real database.
 *
 * This is the most important test in the repository. RLS failures are silent:
 * a missing policy does not raise, it just returns rows — or, worse, accepts a
 * write. Nothing in TypeScript can catch that, so it has to be exercised
 * against Postgres with two genuinely different sessions.
 *
 * Requires a scratch Supabase project with the migrations applied and email
 * confirmation turned off, since the suite signs real users up:
 *
 *   OWNA_TEST_SUPABASE_URL=... OWNA_TEST_SUPABASE_PUBLISHABLE_KEY=... \
 *     bun run test:integration
 */
const url = process.env.OWNA_TEST_SUPABASE_URL;
const key = process.env.OWNA_TEST_SUPABASE_PUBLISHABLE_KEY;

const configured = Boolean(url && key);

function anonymous(): SupabaseClient<Database> {
  return createClient<Database>(url!, key!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function signUpUser(label: string) {
  const client = anonymous();
  const email = `owna-test-${label}-${crypto.randomUUID()}@example.com`;
  const { data, error } = await client.auth.signUp({
    email,
    password: `Test-${crypto.randomUUID()}`,
  });

  if (error) throw new Error(`Could not create ${label}: ${error.message}`);
  if (!data.session) {
    throw new Error(
      `${label} has no session. Turn off email confirmation on the test project.`,
    );
  }

  return client;
}

describe.skipIf(!configured)("row level security", () => {
  let alice: SupabaseClient<Database>;
  let bob: SupabaseClient<Database>;
  let visitor: SupabaseClient<Database>;

  let aliceProfileId: string;
  let alicePageId: string;
  let aliceBlockId: string;
  let aliceUsername: string;

  beforeAll(async () => {
    alice = await signUpUser("alice");
    bob = await signUpUser("bob");
    visitor = anonymous();

    aliceUsername = `alice${Date.now().toString(36)}`;

    const { data: profile, error } = await alice.rpc("claim_username", {
      p_username: aliceUsername,
    });
    if (error || !profile) throw new Error(error?.message ?? "claim failed");
    aliceProfileId = profile.id;

    const { data: page } = await alice
      .from("pages")
      .select("id")
      .eq("profile_id", aliceProfileId)
      .single();
    alicePageId = page!.id;

    const { data: block } = await alice
      .from("blocks")
      .insert({ page_id: alicePageId, type: "hero", position: 0 })
      .select("id")
      .single();
    aliceBlockId = block!.id;
  });

  afterAll(async () => {
    await alice?.auth.signOut();
    await bob?.auth.signOut();
  });

  describe("another signed-in user", () => {
    it("cannot read the profile", async () => {
      const { data } = await bob.from("profiles").select("*").eq("id", aliceProfileId);
      expect(data).toEqual([]);
    });

    it("cannot read the pages or blocks", async () => {
      const { data: pages } = await bob.from("pages").select("*").eq("id", alicePageId);
      const { data: blocks } = await bob.from("blocks").select("*").eq("id", aliceBlockId);
      expect(pages).toEqual([]);
      expect(blocks).toEqual([]);
    });

    it("cannot write to the profile", async () => {
      const { data } = await bob
        .from("profiles")
        .update({ bio: "owned" })
        .eq("id", aliceProfileId)
        .select();
      // An UPDATE that no row passes the USING clause for affects nothing.
      // There is no error to assert on — the silence is the point.
      expect(data ?? []).toEqual([]);

      const { data: after } = await alice
        .from("profiles")
        .select("bio")
        .eq("id", aliceProfileId)
        .single();
      expect(after?.bio).not.toBe("owned");
    });

    it("cannot write to the blocks", async () => {
      await bob.from("blocks").update({ visible: false }).eq("id", aliceBlockId);
      const { data } = await alice
        .from("blocks")
        .select("visible")
        .eq("id", aliceBlockId)
        .single();
      expect(data?.visible).toBe(true);
    });

    it("cannot delete the blocks", async () => {
      await bob.from("blocks").delete().eq("id", aliceBlockId);
      const { data } = await alice.from("blocks").select("id").eq("id", aliceBlockId);
      expect(data).toHaveLength(1);
    });

    it("cannot reassign the profile to themselves", async () => {
      // Without WITH CHECK on the UPDATE policy this is how a row gets stolen.
      const {
        data: { user },
      } = await bob.auth.getUser();

      await bob
        .from("profiles")
        .update({ user_id: user!.id })
        .eq("id", aliceProfileId);

      const { data } = await alice.from("profiles").select("id").eq("id", aliceProfileId);
      expect(data).toHaveLength(1);
    });

    it("cannot publish someone else's profile", async () => {
      // publish_profile derives everything from auth.uid(), so calling it as
      // Bob can only ever publish Bob.
      const { data } = await bob.rpc("publish_profile");
      expect(data?.profile_id).not.toBe(aliceProfileId);
    });
  });

  describe("an anonymous visitor", () => {
    it("cannot read the profiles table at all", async () => {
      const { data } = await visitor.from("profiles").select("*");
      expect(data).toEqual([]);
    });

    it("cannot see an unpublished profile", async () => {
      const { data } = await visitor
        .from("profile_publications")
        .select("*")
        .eq("username", aliceUsername);
      expect(data).toEqual([]);
    });

    it("can see it once published, and not after it is taken offline", async () => {
      await alice.rpc("publish_profile");

      const { data: live } = await visitor
        .from("profile_publications")
        .select("username")
        .eq("username", aliceUsername);
      expect(live).toHaveLength(1);

      await alice.rpc("unpublish_profile");

      const { data: offline } = await visitor
        .from("profile_publications")
        .select("username")
        .eq("username", aliceUsername);
      expect(offline).toEqual([]);
    });
  });

  describe("reserved names", () => {
    it("cannot be claimed through the RPC", async () => {
      const { data } = await bob.rpc("username_available", { candidate: "dashboard" });
      expect(data).toBe(false);
    });

    it("cannot be claimed by writing to the table directly", async () => {
      // The RPC check is a nicety; the trigger is the enforcement.
      const {
        data: { user },
      } = await bob.auth.getUser();

      const { error } = await bob
        .from("profiles")
        .insert({ user_id: user!.id, username: "dashboard" });

      expect(error).not.toBeNull();
    });
  });
});

describe.skipIf(configured)("row level security", () => {
  it.skip("needs OWNA_TEST_SUPABASE_URL and OWNA_TEST_SUPABASE_PUBLISHABLE_KEY", () => {});
});
