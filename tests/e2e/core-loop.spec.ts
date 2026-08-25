import { expect, test } from "@playwright/test";

/**
 * The product loop, end to end: build, edit, theme, publish, share.
 *
 * This is the one test that would catch the failure that matters most — a
 * profile that looks right in the editor but does not appear at its public URL.
 *
 * It enters through the guest path rather than `/signup`. That is not a
 * shortcut: with email confirmation on (which is how the hosted project is
 * configured), signing up produces no session at all until a link in an inbox
 * is clicked, and a browser test has no inbox. The guest path reaches an
 * authenticated session without one, so it is the only route that can drive
 * the whole loop unattended. `account-first.spec.ts` covers the other entrance
 * as far as a browser can honestly take it.
 *
 * Requires a Supabase project with the migrations applied, and anonymous
 * sign-ins plus email auth enabled:
 *
 * Both of these drive the publish gate, which converts the anonymous session
 * with `updateUser()`. With email confirmation on, Supabase sends a message as
 * part of that call and fails the whole call if it cannot. So this test only
 * passes when the project's SMTP sender can actually deliver to the generated
 * address. A failure here reading "Error sending ... email" is a mail
 * configuration problem, not a regression in the flow.
 *
 *   OWNA_E2E=1 bun run test:e2e
 */
const enabled = process.env.OWNA_E2E === "1";

test.describe("core loop", () => {
  test.skip(!enabled, "Set OWNA_E2E=1 and point .env.local at a test project.");

  const suffix = Math.random().toString(36).slice(2, 8);
  const name = `Loop ${suffix}`;
  const email = `owna-e2e-${suffix}@example.com`;
  const password = `Test-${suffix}-password`;
  const username = `e2e${suffix}`;

  test("build, theme, publish, visit", async ({ page, context }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Create your OWNA" }).first().click();
    await page.waitForURL("**/onboarding/questionnaire");

    await page.getByRole("button", { name: /Coaching or consulting/ }).click();
    await page.getByLabel("Name", { exact: true }).fill(name);
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByLabel("Handle").fill(username);
    const create = page.getByRole("button", { name: "Create my OWNA" });
    // The availability check is debounced; the button unlocks when it lands.
    await expect(create).toBeEnabled({ timeout: 10_000 });
    await create.click();

    await page.waitForURL("**/editor");
    await expect(page.getByRole("heading", { name })).toBeVisible();

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

    // Publishing while still a guest opens the account gate first.
    await page.getByRole("button", { name: /Publish/ }).click();
    const gate = page.getByRole("dialog");
    await expect(gate.getByText("Save your OWNA")).toBeVisible();
    await gate.getByLabel("Email").fill(email);
    await gate.getByLabel("Password", { exact: true }).fill(password);
    await gate.getByRole("button", { name: "Create account & publish" }).click();

    const success = page.getByRole("dialog");
    await expect(success.getByText("You're live")).toBeVisible({ timeout: 20_000 });
    await success.getByRole("button", { name: "Keep editing" }).click();

    // A brand new browser context: no cookies, no session — exactly what a
    // stranger following the shared link gets.
    const visitor = await context.browser()!.newContext();
    const publicPage = await visitor.newPage();
    await publicPage.goto(`/${username}`);

    await expect(publicPage.getByRole("heading", { name: "About" })).toBeVisible();
    await expect(publicPage.getByText("Built by an end-to-end test.")).toBeVisible();
    // Nothing from the account form should have leaked into the public HTML.
    await expect(publicPage.locator("body")).not.toContainText(email);

    await visitor.close();
  });
});
