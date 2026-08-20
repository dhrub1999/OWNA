import { describe, expect, it } from "vitest";
import { parseSnapshot, snapshotSeo } from "@/lib/blocks/snapshot";

const base = {
  version: 1,
  profile: {
    username: "maya",
    displayName: "Maya Chandra",
    bio: "Type designer.",
    avatarUrl: "",
    status: "",
    location: "",
  },
  seo: { title: "", description: "", ogImageUrl: "" },
  theme: {},
  layout: {},
  blocks: [{ id: "a", type: "hero", props: {}, style: {} }],
  publishedAt: "2026-01-01T00:00:00Z",
};

describe("published snapshot", () => {
  it("parses what publish_profile() produces", () => {
    const snapshot = parseSnapshot(base);
    expect(snapshot?.profile.username).toBe("maya");
    expect(snapshot?.blocks).toHaveLength(1);
    // The snapshot stores '{}' for an untouched theme; reading fills it in.
    expect(snapshot?.theme.colors.background).toBe("#ffffff");
  });

  it("drops block types this build does not know", () => {
    // Forward compatibility: a snapshot published by a newer deploy must still
    // render on an older one, minus the parts it cannot draw.
    const snapshot = parseSnapshot({
      ...base,
      blocks: [
        { id: "a", type: "hero", props: {}, style: {} },
        { id: "b", type: "hologram", props: {}, style: {} },
      ],
    });
    expect(snapshot?.blocks.map((block) => block.type)).toEqual(["hero"]);
  });

  it("returns null rather than throwing on a broken snapshot", () => {
    // A profile whose snapshot cannot be read is a 404 for one visitor, not a
    // 500 for everyone.
    expect(parseSnapshot(null)).toBeNull();
    expect(parseSnapshot({ profile: {} })).toBeNull();
    expect(parseSnapshot("nonsense")).toBeNull();
  });

  it("tolerates nulls where Postgres wrote them", () => {
    const snapshot = parseSnapshot({
      ...base,
      profile: { ...base.profile, displayName: null, bio: null, status: null },
    });
    expect(snapshot?.profile.displayName).toBe("");
  });
});

describe("SEO defaults", () => {
  it("uses what the user wrote", () => {
    const snapshot = parseSnapshot({
      ...base,
      seo: { title: "Maya — Type", description: "Fonts.", ogImageUrl: "" },
    })!;
    expect(snapshotSeo(snapshot).title).toBe("Maya — Type");
    expect(snapshotSeo(snapshot).description).toBe("Fonts.");
  });

  it("builds a sensible title from the name and status", () => {
    const snapshot = parseSnapshot({
      ...base,
      profile: { ...base.profile, status: "Type designer" },
    })!;
    expect(snapshotSeo(snapshot).title).toBe("Maya Chandra — Type designer");
  });

  it("falls back to the bio for the description", () => {
    expect(snapshotSeo(parseSnapshot(base)!).description).toBe("Type designer.");
  });

  it("falls back to the username when there is no display name", () => {
    const snapshot = parseSnapshot({
      ...base,
      profile: { ...base.profile, displayName: "", bio: "" },
    })!;
    expect(snapshotSeo(snapshot).title).toBe("maya");
    expect(snapshotSeo(snapshot).description).toBe("maya on OWNA.");
  });
});
