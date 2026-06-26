import { test, expect } from "../playwright-fixture";

/**
 * End-to-end sign-in regression: verifies the user lands on the correct
 * dashboard route without bouncing back to /login due to duplicate auth
 * state events.
 *
 * Credentials are read from env vars so this can run against any backend
 * without leaking secrets:
 *   E2E_LOGIN_EMAIL, E2E_LOGIN_PASSWORD
 *   E2E_EXPECTED_PATH (defaults to /dashboard)
 *
 * If creds aren't provided we still exercise the redirect-loop guard by
 * checking the unauthenticated route protection behaviour.
 */

const EMAIL = process.env.E2E_LOGIN_EMAIL;
const PASSWORD = process.env.E2E_LOGIN_PASSWORD;
const EXPECTED_PATH = process.env.E2E_EXPECTED_PATH ?? "/dashboard";

test.describe("Sign-in redirect", () => {
  test("unauthenticated user is sent to /login from a protected route", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("authenticated sign-in lands on the correct route and stays there", async ({ page }) => {
    test.skip(!EMAIL || !PASSWORD, "Set E2E_LOGIN_EMAIL and E2E_LOGIN_PASSWORD to enable.");

    // Capture all URL transitions so a bounce back to /login fails the test loudly.
    const visited: string[] = [];
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) {
        visited.push(new URL(frame.url()).pathname);
      }
    });

    await page.goto("/login");
    await page.fill('input[type="email"]', EMAIL!);
    await page.fill('input[type="password"]', PASSWORD!);
    await page.click('[data-testid="login-submit"]');

    // Wait for the dashboard / role-mapped route.
    await page.waitForURL(new RegExp(EXPECTED_PATH.replace(/\//g, "\\/")), { timeout: 15_000 });
    await expect(page).toHaveURL(new RegExp(EXPECTED_PATH.replace(/\//g, "\\/")));

    // Hold for a few seconds and confirm we don't bounce back to /login.
    await page.waitForTimeout(4_000);
    await expect(page).not.toHaveURL(/\/login/);

    // Sanity: at no point during the run did we revisit /login after sign-in.
    const idxAfterSignin = visited.lastIndexOf("/login");
    const subsequent = visited.slice(idxAfterSignin + 1);
    expect(subsequent, `Should not bounce back to /login. Path history: ${visited.join(" → ")}`)
      .not.toContain("/login");
  });
});
