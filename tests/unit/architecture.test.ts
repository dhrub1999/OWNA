import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The two structural rules the whole design rests on, enforced rather than
 * documented.
 *
 * They are easy to break by accident — one convenient import of a shared
 * control into a block renderer and the public page starts shipping the colour
 * picker — and the damage is invisible until someone reads a bundle report.
 */
const root = path.resolve(import.meta.dirname, "../..");

function filesUnder(dir: string): string[] {
  const absolute = path.join(root, dir);
  const out: string[] = [];

  const walk = (current: string) => {
    for (const entry of readdirSync(current)) {
      const full = path.join(current, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.tsx?$/.test(entry)) out.push(full);
    }
  };

  walk(absolute);
  return out;
}

function importsOf(file: string): string[] {
  const source = readFileSync(file, "utf8");
  return [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1]);
}

const relative = (file: string) => path.relative(root, file);

describe("the public page cannot reach editor code", () => {
  const publicSurface = [
    ...filesUnder("components/public"),
    ...filesUnder("app/[username]"),
    ...filesUnder("components/icons"),
  ];

  const forbidden = [
    "@/components/editor",
    "@/lib/editor",
    "react-colorful",
    "@dnd-kit",
    "@/components/ui/",
  ];

  it.each(publicSurface.map((file) => [relative(file), file]))(
    "%s imports nothing editor-only",
    (_label, file) => {
      const offenders = importsOf(file).filter((specifier) =>
        forbidden.some((prefix) => specifier.startsWith(prefix)),
      );
      expect(offenders).toEqual([]);
    },
  );
});

describe("block definitions stay pure data", () => {
  // definitions.ts is imported by the editor, the public renderer, the save
  // action and the tests. A React import here would drag components into every
  // one of those.
  const file = path.join(root, "lib/blocks/definitions.ts");

  it("imports no React and no components", () => {
    const offenders = importsOf(file).filter(
      (specifier) =>
        specifier === "react" ||
        specifier.startsWith("react/") ||
        specifier.startsWith("@/components"),
    );
    expect(offenders).toEqual([]);
  });

  it("is a .ts file, so it cannot contain JSX by construction", () => {
    expect(file.endsWith(".ts")).toBe(true);
  });
});

describe("cached reads never touch cookies", () => {
  // `use cache` rejects cookies() and headers() anywhere in the call stack, and
  // it fails at request time rather than at build — so this is worth catching
  // here rather than in production.
  const file = path.join(root, "lib/supabase/queries.ts");
  const source = readFileSync(file, "utf8");

  it("uses the cookie-less client", () => {
    expect(source).toContain("createPublicClient");
    expect(source).not.toContain("@/lib/supabase/server");
    expect(source).not.toContain("next/headers");
  });

  it("tags every cached read so publishing can invalidate it", () => {
    const cacheDirectives = source.match(/"use cache"/g) ?? [];
    const tags = source.match(/cacheTag\(/g) ?? [];
    expect(tags.length).toBeGreaterThanOrEqual(cacheDirectives.length);
  });
});
