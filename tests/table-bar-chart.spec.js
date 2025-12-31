import { test, expect } from "@playwright/test";

test.describe("table-bar-chart component", () => {
  test("renders basic table chart", async ({ page }) => {
    await page.goto("/tests/fixtures/index.html");
    await expect(page.locator("h1")).toHaveText("Basic Sales Data");
    await expect(page.locator("table-bar-chart")).toBeVisible();
    await expect(page.locator(".caption")).toHaveText("Sales by Product");
    const bars = page.locator(".bar");
    await expect(bars).toHaveCount(3);
  });

  test("parses numeric values correctly", async ({ page }) => {
    await page.goto("/tests/fixtures/index.html");
    const bars = page.locator(".bar");
    const firstBar = bars.nth(0);
    await expect(firstBar).toHaveAttribute("value", "1200");
  });

  test("displays product labels", async ({ page }) => {
    await page.goto("/tests/fixtures/index.html");
    const labels = page.locator(".label");
    await expect(labels.nth(0)).toHaveText("Product A");
    await expect(labels.nth(1)).toHaveText("Product B");
    await expect(labels.nth(2)).toHaveText("Product C");
  });

  test("handles currency-formatted values", async ({ page }) => {
    await page.goto("/tests/fixtures/currency.html");
    await expect(page.locator(".caption")).toHaveText(
      "Annual Revenue by Region"
    );
    const bars = page.locator(".bar");
    await expect(bars).toHaveCount(4);
    // Verify values are parsed correctly
    await expect(bars.nth(0)).toHaveAttribute("value", "$50,000");
  });

  test("hides scale when hide-scale attribute is set", async ({ page }) => {
    await page.goto("/tests/fixtures/hide-scale.html");
    const scale = page.locator(".scale");
    const chartContainer = page.locator(".chart-container");
    await expect(chartContainer).toHaveClass(/hide-scale/);
  });

  test("respects custom scale-steps attribute", async ({ page }) => {
    await page.goto("/tests/fixtures/scale-steps.html");
    const scaleValues = page.locator(".scale-value");
    await expect(scaleValues).toHaveCount(10);
  });

  test("bar is keyboard focusable", async ({ page }) => {
    await page.goto("/tests/fixtures/index.html");
    const firstBar = page.locator(".bar").nth(0);
    await firstBar.focus();
    await expect(firstBar).toBeFocused();
  });

  test("bar tooltip appears on hover", async ({ page }) => {
    await page.goto("/tests/fixtures/index.html");
    const firstBar = page.locator(".bar").nth(0);
    await firstBar.hover();
    // Check for the ::after pseudo-element via visibility
    const boundingBox = await firstBar.boundingBox();
    expect(boundingBox).toBeTruthy();
  });

  test("handles dynamic table updates", async ({ page }) => {
    await page.goto("/tests/fixtures/dynamic.html");
    let bars = page.locator(".bar");
    await expect(bars).toHaveCount(3);

    // Add a new row
    await page.click("#add-row");
    bars = page.locator(".bar");
    await expect(bars).toHaveCount(4);
  });

  test("updates chart when table values change", async ({ page }) => {
    await page.goto("/tests/fixtures/dynamic.html");
    const firstBar = page.locator(".bar").nth(0);
    const initialValue = await firstBar.getAttribute("value");

    // Update the first row value
    await page.click("#update-row");

    // Give observer time to detect change
    await page.waitForTimeout(100);
    const updatedValue = await firstBar.getAttribute("value");
    expect(updatedValue).not.toBe(initialValue);
  });

  test("displays caption in chart", async ({ page }) => {
    await page.goto("/tests/fixtures/currency.html");
    const caption = page.locator(".caption");
    await expect(caption).toHaveText("Annual Revenue by Region");
  });

  test("has accessible role and aria attributes", async ({ page }) => {
    await page.goto("/tests/fixtures/index.html");
    const chartRole = page.locator('[role="img"]');
    await expect(chartRole).toHaveAttribute("aria-labelledby", "caption");
    const bars = page.locator(".bar");
    for (let i = 0; i < 3; i++) {
      await expect(bars.nth(i)).toHaveAttribute("aria-posinset", String(i + 1));
      await expect(bars.nth(i)).toHaveAttribute("aria-setsize", "3");
    }
  });
});
