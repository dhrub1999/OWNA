import { describe, expect, it } from "vitest";
import { activationSteps } from "@/lib/onboarding/activation";
import { previewSnapshot } from "@/lib/onboarding/preview-snapshot";
import { authErrorCopy } from "@/lib/auth/errors";
import { safeNextTarget } from "@/lib/validations/auth";
import { isGuestSession, needsEmailConfirmation } from "@/lib/auth/session";
import type { BlockRow, ProfileRow } from "@/lib/supabase/profile";

describe("safeNextTarget", () => {
  const origin = "https://owna.app";

  it("keeps a plain path", () => {
    expect(safeNextTarget("/dashboard", origin)).toBe("/dashboard");
  });

  it("reduces a same-origin absolute URL to its path", () => {
    // This is the shape Supabase produces for `{{ .RedirectTo }}`.
    expect(safeNextTarget("https://owna.app/dashboard", origin)).toBe("/dashboard");
  });

  it("keeps the query and hash of a same-origin URL", () => {
    expect(safeNextTarget("https://owna.app/editor?publish=1#top", origin)).toBe(
      "/editor?publish=1#top",
    );
  });

  it.each([
    ["https://evil.example/dashboard", "another origin"],
    ["//evil.example", "protocol-relative"],
    ["http://owna.app/dashboard", "scheme mismatch"],
    ["javascript:alert(1)", "script URL"],
    ["dashboard", "bare relative"],
    [null, "missing"],
  ])("refuses %s (%s)", (value: string | null, _reason: string) => {
    expect(safeNextTarget(value, origin)).toBeNull();
  });
});

describe("session predicates", () => {
  it("treats a bare anonymous session as a guest", () => {
    expect(isGuestSession({ is_anonymous: true })).toBe(true);
  });

  it("stops treating it as a guest once an email is attached", () => {
    // `is_anonymous` stays true until the confirmation link is clicked, so
    // keying only off it would re-open the publish gate on someone who has
    // already given us credentials.
    expect(isGuestSession({ is_anonymous: true, email: "a@b.co" })).toBe(false);
  });

  it("is not a guest with no session at all", () => {
    expect(isGuestSession(null)).toBe(false);
  });

  it("asks for confirmation exactly while an email is unconfirmed", () => {
    expect(needsEmailConfirmation({ email: "a@b.co" })).toBe(true);
    expect(
      needsEmailConfirmation({ email: "a@b.co", email_confirmed_at: "2026-01-01" }),
    ).toBe(false);
    expect(needsEmailConfirmation(null)).toBe(false);
  });

  it("covers the upgraded-but-unconfirmed session in both directions", () => {
    // The state the two predicates exist to disagree about: past the gate,
    // still nagged about the inbox.
    const user = { is_anonymous: true, email: "a@b.co" };
    expect(isGuestSession(user)).toBe(false);
    expect(needsEmailConfirmation(user)).toBe(true);
  });

  it("recognises a pending upgrade even though `email` itself stays empty", () => {
    // What supabase.auth.updateUser({ email }) actually does to an anonymous
    // session's user object, confirmed live against the API: the address
    // lands in `new_email` (auth.users.email_change) and `email` stays "" —
    // it is never populated immediately, only once the confirmation link is
    // clicked. A predicate that only checked `email` would treat this exact
    // state as still-a-guest and still-not-pending, which is how a second
    // Publish reopened the account-creation gate right after the first one
    // had just been completed.
    const user = { is_anonymous: true, email: "", new_email: "a@b.co" };
    expect(isGuestSession(user)).toBe(false);
    expect(needsEmailConfirmation(user)).toBe(true);
  });
});

describe("auth error copy", () => {
  it("has copy for every code the auth routes redirect with", () => {
    for (const code of [
      "invalid_link",
      "expired_link",
      "missing_code",
      "exchange_failed",
      "no_session",
    ]) {
      expect(authErrorCopy(code)).not.toBeNull();
    }
  });

  it("offers a way to get a fresh link for the two link failures", () => {
    expect(authErrorCopy("expired_link")?.action?.href).toBe("/forgot-password");
    expect(authErrorCopy("invalid_link")?.action?.href).toBe("/forgot-password");
  });

  it("returns null for anything it does not recognise", () => {
    expect(authErrorCopy("made_up")).toBeNull();
    expect(authErrorCopy(null)).toBeNull();
  });
});

describe("preview snapshot", () => {
  it("renders something before any question is answered", () => {
    const snapshot = previewSnapshot({ purpose: "", name: "", username: "" });
    expect(snapshot.blocks.length).toBeGreaterThan(0);
    expect(snapshot.profile.username).toBe("yourname");
  });

  it("carries the answers into the profile", () => {
    const snapshot = previewSnapshot({
      purpose: "photographer",
      name: "Maya Tanaka",
      username: "maya",
    });
    expect(snapshot.profile.displayName).toBe("Maya Tanaka");
    expect(snapshot.profile.username).toBe("maya");
  });

  it("changes theme with the purpose", () => {
    const a = previewSnapshot({ purpose: "consultant", name: "", username: "" });
    const b = previewSnapshot({ purpose: "photographer", name: "", username: "" });
    expect(a.theme).not.toEqual(b.theme);
  });

  it("gives every block a distinct id so React can key them", () => {
    const snapshot = previewSnapshot({ purpose: "creative", name: "", username: "" });
    const ids = snapshot.blocks.map((block) => block.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("activation steps", () => {
  const profile = {
    bio: null,
    avatar_url: null,
  } as unknown as ProfileRow;

  function block(type: string, props: unknown): BlockRow {
    return { type, props } as unknown as BlockRow;
  }

  it("marks everything undone on a fresh draft", () => {
    const steps = activationSteps({ profile, blocks: [], isLive: false });
    expect(steps.every((step) => !step.done)).toBe(true);
  });

  it("accepts a bio from either the profile or the hero block", () => {
    const fromProfile = activationSteps({
      profile: { ...profile, bio: "Designer" } as ProfileRow,
      blocks: [],
      isLive: false,
    });
    const fromBlock = activationSteps({
      profile,
      blocks: [block("hero", { bio: "Designer" })],
      isLive: false,
    });

    expect(fromProfile.find((s) => s.id === "bio")?.done).toBe(true);
    expect(fromBlock.find((s) => s.id === "bio")?.done).toBe(true);
  });

  it("does not count a hero whose bio is only whitespace", () => {
    const steps = activationSteps({
      profile,
      blocks: [block("hero", { bio: "   " })],
      isLive: false,
    });
    expect(steps.find((s) => s.id === "bio")?.done).toBe(false);
  });

  it("counts links from either a links or a social block", () => {
    for (const type of ["links", "social"]) {
      const steps = activationSteps({
        profile,
        blocks: [block(type, { items: [{ label: "Site" }] })],
        isLive: false,
      });
      expect(steps.find((s) => s.id === "links")?.done).toBe(true);
    }
  });

  it("does not count an empty links block", () => {
    const steps = activationSteps({
      profile,
      blocks: [block("links", { items: [] })],
      isLive: false,
    });
    expect(steps.find((s) => s.id === "links")?.done).toBe(false);
  });

  it("survives a block whose props are not the shape it expects", () => {
    const steps = activationSteps({
      profile,
      blocks: [block("links", null), block("hero", "nonsense")],
      isLive: false,
    });
    expect(steps.find((s) => s.id === "links")?.done).toBe(false);
    expect(steps.find((s) => s.id === "bio")?.done).toBe(false);
  });
});
