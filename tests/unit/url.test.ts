import { describe, expect, it } from "vitest";
import {
  isSafeUrl,
  normalizeUrl,
  safeHref,
  safeImageSrc,
} from "@/lib/validations/url";

describe("URL validation", () => {
  it("assumes https for a bare domain, because that is how people type links", () => {
    expect(normalizeUrl("example.com")).toBe("https://example.com/");
    expect(normalizeUrl("  example.com/page  ")).toBe("https://example.com/page");
  });

  it("keeps a protocol the user actually declared", () => {
    expect(normalizeUrl("http://example.com")).toBe("http://example.com/");
    expect(normalizeUrl("mailto:you@example.com")).toBe("mailto:you@example.com");
  });

  // The reason the allowlist exists: both of these execute when clicked.
  it.each([
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "  javascript:alert(1)",
    "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
  ])("rejects %s", (hostile) => {
    expect(normalizeUrl(hostile)).toBeNull();
    expect(isSafeUrl(hostile)).toBe(false);
    expect(safeHref(hostile)).toBeUndefined();
  });

  it("returns undefined for empty input so the caller can drop the attribute", () => {
    expect(safeHref("")).toBeUndefined();
    expect(safeHref(null)).toBeUndefined();
    expect(safeHref(undefined)).toBeUndefined();
  });

  it("holds image sources to a narrower set than links", () => {
    expect(safeImageSrc("https://cdn.example.com/a.png")).toBe(
      "https://cdn.example.com/a.png",
    );
    // Valid for a link, never for an <img src>.
    expect(safeImageSrc("mailto:you@example.com")).toBeUndefined();
    expect(safeImageSrc("javascript:alert(1)")).toBeUndefined();
  });

  it("percent-encodes quotes, which is what keeps a URL safe inside a CSS url()", () => {
    const encoded = safeImageSrc('https://example.com/a"b.png');
    expect(encoded).not.toContain('"');
  });
});
