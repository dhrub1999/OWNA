import { describe, expect, it } from "vitest";
import {
  BLOCK_META,
  BLOCK_TYPES,
  defaultBlockProps,
  isBlockType,
  parseBlockProps,
  parseBlockStyle,
  starterBlockProps,
} from "@/lib/blocks/definitions";

describe("block definitions", () => {
  it("gives every type metadata and a schema", () => {
    for (const type of BLOCK_TYPES) {
      expect(BLOCK_META[type]).toBeDefined();
      expect(() => defaultBlockProps(type)).not.toThrow();
    }
  });

  it("parses garbage into defaults rather than throwing", () => {
    // Rows written by an older prop schema outlive the code that wrote them,
    // so a renderer must never be handed something it cannot use.
    for (const type of BLOCK_TYPES) {
      expect(() => parseBlockProps(type, null)).not.toThrow();
      expect(() => parseBlockProps(type, { nonsense: true })).not.toThrow();
      expect(() => parseBlockProps(type, "a string")).not.toThrow();
    }
  });

  it("round-trips its own defaults unchanged", () => {
    for (const type of BLOCK_TYPES) {
      const defaults = defaultBlockProps(type);
      expect(parseBlockProps(type, defaults)).toEqual(defaults);
    }
  });

  it("keeps valid fields while replacing invalid neighbours", () => {
    const props = parseBlockProps("links", {
      heading: "My stuff",
      style: "not-a-style",
      items: [{ id: "a", label: "One", url: "example.com" }],
    });
    expect(props.heading).toBe("My stuff");
    expect(props.style).toBe("solid");
    expect(props.items).toHaveLength(1);
  });

  it("caps repeatable lists", () => {
    const tooMany = Array.from({ length: 200 }, (_, index) => ({
      id: String(index),
      label: "x",
      url: "example.com",
    }));
    // Over the cap the array fails and falls back to empty rather than letting
    // an unbounded list through to the database.
    expect(parseBlockProps("links", { items: tooMany }).items).toHaveLength(0);
  });

  it("recognises only known types", () => {
    expect(isBlockType("hero")).toBe(true);
    expect(isBlockType("marquee")).toBe(false);
    expect(isBlockType(42)).toBe(false);
  });

  it("seeds new blocks with something to look at", () => {
    expect(starterBlockProps("text").body.length).toBeGreaterThan(0);
    expect(starterBlockProps("social").links.length).toBeGreaterThan(0);
    // A block with nothing worth pre-filling stays at its defaults.
    expect(starterBlockProps("divider")).toEqual(defaultBlockProps("divider"));
  });

  it("gives every new sub-item a distinct id", () => {
    const first = starterBlockProps("social").links[0]?.id;
    const second = starterBlockProps("social").links[0]?.id;
    expect(first).not.toBe(second);
  });

  it("normalizes block style overrides", () => {
    expect(parseBlockStyle({}).surface).toBe("none");
    expect(parseBlockStyle({ spacing: 9999 }).spacing).toBe(96);
    expect(parseBlockStyle({ surface: "hologram" }).surface).toBe("none");
  });
});
