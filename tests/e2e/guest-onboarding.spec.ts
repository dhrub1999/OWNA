import { expect, test } from "@playwright/test";
import { e2eEmail } from "./test-email";

/**
 * The product-first loop: build a page anonymously, then publish forces an
 * account into existence instead of gating the whole flow behind one.
 *
 * Requires a Supabase project with the migrations applied, Anonymous
 * sign-ins and Manual linking enabled, and Email auth enabled:
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

test.describe("guest onboarding", () => {
  test.skip(!enabled, "Set OWNA_E2E=1 and point .env.local at a test project.");

  const suffix = Math.random().toString(36).slice(2, 8);
  const name = `Guest ${suffix}`;
  const username = `guest${suffix}`;
  const email = e2eEmail(`owna-e2e-guest-${suffix}`);
  const password = `Test-${suffix}-password`;

  test("anonymous build, publish gate, account creation, live page", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Create your OWNA" }).first().click();

    // The button signs the visitor in anonymously before routing here.
    await page.waitForURL("**/onboarding/questionnaire");

    await page.getByRole("button", { name: /Coaching or consulting/ }).click();

    await page.getByLabel("Name", { exact: true }).fill(name);
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByLabel("Handle").fill(username);
    const createButton = page.getByRole("button", { name: "Create my OWNA" });
    // The availability check is debounced; the button unlocks when it lands.
    await expect(createButton).toBeEnabled({ timeout: 10_000 });
    await createButton.click();

    await page.waitForURL("**/editor");
    // The curated template is seeded before the editor ever renders. The hero
    // block's own fields are left blank, so it falls back to the profile's
    // display name rather than showing a curated persona's placeholder copy.
    await expect(page.getByRole("heading", { name })).toBeVisible();

    // Publishing while anonymous opens the account gate instead of publishing.
    await page.getByRole("button", { name: /Publish/ }).click();
    const gate = page.getByRole("dialog");
    await expect(gate.getByText("Save your OWNA")).toBeVisible();

    await gate.getByLabel("Email").fill(email);
    await gate.getByLabel("Password", { exact: true }).fill(password);
    await gate.getByRole("button", { name: "Create account & publish" }).click();

    // The gate closes and the interrupted publish resumes on its own — same
    // session, same auth.uid(), nothing about the draft was lost. A first
    // publish is celebrated with a dialog rather than a toast.
    const success = page.getByRole("dialog");
    await expect(success.getByText("You're live")).toBeVisible({ timeout: 20_000 });
    // The label is built from `siteUrl()`, which is localhost under test and
    // the real domain in production. Only the handle is stable across both.
    await expect(success.getByText(new RegExp(`/${username}$`))).toBeVisible();
    await success.getByRole("button", { name: "Keep editing" }).click();

    // A brand new browser context: no cookies, no session — exactly what a
    // stranger following the shared link gets.
    const visitor = await context.browser()!.newContext();
    const publicPage = await visitor.newPage();
    await publicPage.goto(`/${username}`);

    await expect(publicPage.getByRole("heading", { name })).toBeVisible();
    // Nothing from the account-creation form should have leaked into the
    // public HTML.
    await expect(publicPage.locator("body")).not.toContainText(email);

    await visitor.close();
  });
});
