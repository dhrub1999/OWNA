import { describe, expect, it } from "vitest";
import {
  USERNAME_PATTERN,
  sanitizeUsernameInput,
  suggestUsername,
  usernameFormatError,
  usernameSchema,
} from "@/lib/validations/username";

/**
 * This pattern is duplicated in `private.is_valid_username` in the migrations.
 * The database is authoritative; these tests pin the client copy to the same
 * rules so the two cannot quietly diverge.
 */
describe("username rules", () => {
  it.each(["tamal", "abc", "a-b_c", "user123", "a".repeat(30)])(
    "accepts %s",
    (name) => {
      expect(USERNAME_PATTERN.test(name)).toBe(true);
      expect(usernameSchema.safeParse(name).success).toBe(true);
    },
  );

  it.each([
    ["ab", "too short"],
    ["a".repeat(31), "too long"],
    ["-abc", "leading dash"],
    ["abc-", "trailing dash"],
    ["_abc", "leading underscore"],
    ["ab c", "space"],
    ["ab.c", "dot"],
    ["ab/c", "slash"],
    ["Tamal", "uppercase is not in the character class"],
    ["tam@l", "symbol"],
  ])("rejects %s (%s)", (name) => {
    expect(USERNAME_PATTERN.test(name)).toBe(false);
  });

  it("lowercases before validating, so a typed capital is not an error", () => {
    const parsed = usernameSchema.safeParse("Tamal");
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data).toBe("tamal");
  });

  it("explains what is wrong rather than just refusing", () => {
    expect(usernameFormatError("ab")).toMatch(/3 characters/);
    expect(usernameFormatError("ab c")).toMatch(/letters, numbers/i);
    expect(usernameFormatError("-ab")).toMatch(/start and end/i);
    expect(usernameFormatError("tamal")).toBeNull();
    expect(usernameFormatError("")).toBeNull();
  });

  it("strips as you type instead of rejecting", () => {
    expect(sanitizeUsernameInput("Tamal Biswas!")).toBe("tamalbiswas");
    expect(sanitizeUsernameInput("a".repeat(50))).toHaveLength(30);
  });

  it("suggests something valid from an email", () => {
    const suggestion = suggestUsername("tamal.biswas@example.com");
    expect(USERNAME_PATTERN.test(suggestion)).toBe(true);
  });

  it("pads a suggestion that would otherwise be too short", () => {
    const suggestion = suggestUsername("jo@example.com");
    expect(suggestion.length).toBeGreaterThanOrEqual(3);
    expect(USERNAME_PATTERN.test(suggestion)).toBe(true);
  });
});
