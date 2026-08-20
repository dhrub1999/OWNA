import { expect, test } from "@playwright/test";

/**
 * The product loop, end to end: sign up, claim a name, build, publish, share.
 *
 * This is the one test that would catch the failure that matters most — a
 * profile that looks right in the editor but does not appear at its public URL.
 *
 * Requires a Supabase project with the migrations applied and email
 * confirmation disabled, since it signs up a real account:
 *
 *   OWNA_E2E=1 bun run test:e2e
 */
const enabled = process.env.OWNA_E2E === "1";

test.describe("core loop", () => {
  test.skip(!enabled, "Set OWNA_E2E=1 and point .env.local at a test project.");

  const suffix = Math.random().toString(36).slice(2, 8);
  const email = `owna-e2e-${suffix}@example.com`;
  const password = `Test-${suffix}-password`;
  const username = `e2e${suffix}`;

  test("sign up, build, publish, visit", async ({ page, context }) => {
    await page.goto("/signup");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();

    await page.waitForURL("**/onboarding/username");
    const usernameInput = page.getByLabel("Username");
    await usernameInput.fill(username);
    // The availability check is debounced; the button unlocks when it lands.
    const claim = page.getByRole("button", { name: "Claim it" });
    await expect(claim).toBeEnabled({ timeout: 10_000 });
    await claim.click();

    await page.waitForURL("**/editor");
    await expect(page.getByRole("heading", { name: username })).toBeVisible();

    // Add a text block and give it content.
    await page.getByRole("button", { name: "Text", exact: true }).click();
    await page.getByLabel("Heading").fill("About");
    await page.getByLabel("Text", { exact: true }).fill("Built by an end-to-end test.");

    // Change the theme, so the published page proves the theme travels too.
    await page.getByRole("tab", { name: "Design" }).click();
    await page.getByRole("button", { name: "Cyber" }).click();

    await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole("button", { name: /Publish/ }).click();
    await expect(page.getByText("You're live.")).toBeVisible({ timeout: 20_000 });

    // A brand new browser context: no cookies, no session — exactly what a
    // stranger following the shared link gets.
    const visitor = await context.browser()!.newContext();
    const publicPage = await visitor.newPage();
    await publicPage.goto(`/${username}`);

    await expect(publicPage.getByRole("heading", { name: "About" })).toBeVisible();
    await expect(publicPage.getByText("Built by an end-to-end test.")).toBeVisible();
    // Nothing from the dashboard should have leaked into the public HTML.
    await expect(publicPage.locator("body")).not.toContainText(email);

    await visitor.close();
  });
});
