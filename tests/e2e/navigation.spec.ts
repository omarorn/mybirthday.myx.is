import { test, expect } from "@playwright/test";

test.describe("Navigation & page load", () => {
  test("loads the home page and shows hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Afmæli/i);
    const hero = page.locator("#sec-home");
    await expect(hero).toBeVisible();
  });

  test("has 8 nav chips", async ({ page }) => {
    await page.goto("/");
    const chips = page.locator("button.nav-chip");
    await expect(chips).toHaveCount(8);
  });

  test("clicking RSVP chip scrolls to RSVP section", async ({ page }) => {
    await page.goto("/");
    await page.click('button.nav-chip[data-jump="sec-rsvp"]');
    const rsvp = page.locator("#sec-rsvp");
    await expect(rsvp).toBeVisible();
  });

  test("clicking Quiz chip scrolls to quiz section", async ({ page }) => {
    await page.goto("/");
    await page.click('button.nav-chip[data-jump="sec-quiz"]');
    const quiz = page.locator("#sec-quiz");
    await expect(quiz).toBeVisible();
  });

  test("serves HTML with injected slug script", async ({ page }) => {
    const response = await page.goto("/omars50");
    expect(response?.status()).toBe(200);
    const content = await page.content();
    expect(content).toContain("window.__APP_SLUG__=");
  });

  test("favicon returns 204", async ({ request }) => {
    const response = await request.get("/favicon.ico");
    expect(response.status()).toBe(204);
  });
});
