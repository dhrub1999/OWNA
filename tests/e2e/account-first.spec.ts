import { expect, test } from "@playwright/test";

/**
 * The signup-first entrance, and the guards around it.
 *
 * With email confirmation on, a browser cannot follow this path past the
 * "check your email" screen without an inbox. So this covers the parts that
 * *are* observable: that signup lands somewhere with a way forward rather than
 * a dead end, that a broken confirmation link explains itself instead of
 * dumping the visitor on a blank form, and that a guest with an unpublished
 * draft is warned before signing into another account.
 *
 * Each of these was a real gap before it was a test.
 *
 *   OWNA_E2E=1 bun run test:e2e
 */
const enabled = process.env.OWNA_E2E === "1";

test.describe("account-first onboarding", () => {
  test.skip(!enabled, "Set OWNA_E2E=1 and point .env.local at a test project.");

  test("the check-email screen offers a way forward, not a dead end", async ({
    page,
  }) => {
    // Driven directly rather than by signing up, so the test neither depends on
    // outbound deliverability nor spends a send from the daily quota. What is
    // under test is the screen, which used to name the address and stop there.
    const email = "someone@example.com";
    await page.goto(`/signup/check-email?email=${encodeURIComponent(email)}`);

    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();

    // The resend control starts on its cooldown, because arriving here means a
    // send has just happened. Both halves matter: no dead end, and no
    // invitation to immediately burn a second send.
    await expect(
      page.getByRole("button", { name: /Send it again in \d+s/ }),
    ).toBeDisabled();
    await expect(page.getByRole("link", { name: "Sign up again" })).toBeVisible();
  });

  test("an expired confirmation link explains itself", async ({ page }) => {
    // A well-formed link carrying a token that was never valid: the same thing
    // an expired or already-used link produces.
    await page.goto("/auth/confirm?token_hash=not-a-real-token&type=signup");

    await page.waitForURL("**/login**");
    await expect(page.getByText("That link has expired")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send a new link" })).toBeVisible();
  });

  test("a malformed link is told apart from an expired one", async ({ page }) => {
    await page.goto("/auth/confirm");

    await page.waitForURL("**/login**");
    await expect(page.getByText("That link didn't look right")).toBeVisible();
  });

  test("a guest with a draft is warned before signing into another account", async ({
    page,
  }) => {
    const suffix = Math.random().toString(36).slice(2, 8);
    const username = `warn${suffix}`;

    await page.goto("/");
    await page.getByRole("button", { name: "Create your OWNA" }).first().click();
    await page.waitForURL("**/onboarding/questionnaire");

    await page.getByRole("button", { name: /Coaching or consulting/ }).click();
    await page.getByLabel("Name", { exact: true }).fill(`Warn ${suffix}`);
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByLabel("Handle").fill(username);
    const create = page.getByRole("button", { name: "Create my OWNA" });
    await expect(create).toBeEnabled({ timeout: 10_000 });
    await create.click();
    await page.waitForURL("**/editor");

    // Reaching /login by URL used to switch accounts with no warning at all,
    // stranding the draft with no way back.
    await page.goto("/login");
    await expect(page.getByText("You have an unpublished draft")).toBeVisible();
    await expect(page.getByText(username)).toBeVisible();

    await page.getByRole("button", { name: "Back to my draft" }).click();
    await page.waitForURL("**/editor");
  });
});
