import { describe, expect, it } from "vitest";
import { safeNextPath, safeNextTarget } from "@/lib/validations/auth";

const ORIGIN = "https://owna.app";

// Written as an escape rather than a literal so the difference between one
// backslash and two survives every editor and diff these cases pass through.
const BS = "\\";

/**
 * Every case below is a value that reaches `?next=` from the query string and
 * ends up in a `Location` header. What matters is not the return value on its
 * own but what a browser does with it, so each rejection is paired with the
 * off-site URL the raw input would otherwise resolve to.
 */
describe("safeNextPath", () => {
  it("passes an ordinary same-origin path through intact", () => {
    expect(safeNextPath("/dashboard")).toBe("/dashboard");
    expect(safeNextPath("/editor?tab=theme#hero")).toBe("/editor?tab=theme#hero");
    expect(safeNextPath("/")).toBe("/");
  });

  it("rejects a protocol-relative path", () => {
    expect(new URL("//evil.example", ORIGIN).href).toBe("https://evil.example/");
    expect(safeNextPath("//evil.example")).toBeNull();
  });

  // A backslash is a second slash to the URL parser, so this names a host while
  // still passing every leading-character check.
  it("rejects a backslash standing in for the second slash", () => {
    expect(new URL(`/${BS}evil.example`, ORIGIN).href).toBe("https://evil.example/");
    expect(safeNextPath(`/${BS}evil.example`)).toBeNull();
    expect(safeNextPath(`/${BS}${BS}evil.example`)).toBeNull();
  });

  // Tab, LF and CR are stripped before parsing, so they smuggle the backslash
  // past anything that only inspects the first two characters.
  it("rejects a backslash hidden behind stripped whitespace", () => {
    expect(new URL(`/\t${BS}evil.example`, ORIGIN).href).toBe(
      "https://evil.example/",
    );
    expect(safeNextPath(`/\t${BS}evil.example`)).toBeNull();
    expect(safeNextPath(`/\n${BS}evil.example`)).toBeNull();
    expect(safeNextPath("/\r//evil.example")).toBeNull();
  });

  // Normalizing `..` can leave a protocol-relative path behind even though the
  // input was an unremarkable-looking relative one.
  it("rejects a path that normalizes into a protocol-relative one", () => {
    expect(safeNextPath("/..//evil.example")).toBeNull();
  });

  it("leaves an encoded backslash alone, because it is only ever a path", () => {
    expect(safeNextPath("/%5Cevil.example")).toBe("/%5Cevil.example");
  });

  it("rejects anything that is not a path at all", () => {
    expect(safeNextPath("https://evil.example")).toBeNull();
    expect(safeNextPath("javascript:alert(1)")).toBeNull();
    expect(safeNextPath("")).toBeNull();
    expect(safeNextPath(null)).toBeNull();
    expect(safeNextPath(undefined)).toBeNull();
  });
});

describe("safeNextTarget", () => {
  it("accepts an absolute URL on our own origin and returns its path", () => {
    expect(safeNextTarget(`${ORIGIN}/dashboard`, ORIGIN)).toBe("/dashboard");
    expect(safeNextTarget(`${ORIGIN}/reset-password?x=1`, ORIGIN)).toBe(
      "/reset-password?x=1",
    );
  });

  it("resolves an absolute URL with no path to the root", () => {
    expect(safeNextTarget(ORIGIN, ORIGIN)).toBe("/");
  });

  it("still accepts a bare path, the way safeNextPath does", () => {
    expect(safeNextTarget("/dashboard", ORIGIN)).toBe("/dashboard");
  });

  it("refuses another origin", () => {
    expect(safeNextTarget("https://evil.example/dashboard", ORIGIN)).toBeNull();
    expect(safeNextTarget("https://owna.app.evil.example/", ORIGIN)).toBeNull();
    expect(safeNextTarget("http://owna.app/dashboard", ORIGIN)).toBeNull();
  });

  // The same guard as safeNextPath, reached through the absolute-URL branch.
  it("refuses a same-origin URL whose path is protocol-relative", () => {
    expect(safeNextTarget(`${ORIGIN}//evil.example`, ORIGIN)).toBeNull();
    expect(safeNextTarget(`/${BS}evil.example`, ORIGIN)).toBeNull();
  });
});
