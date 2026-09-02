import { expect, test } from "@playwright/test";

test("a judge can inspect recovery value and a policy block", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: /Turn risk signals into recovered revenue/i })).toBeVisible();
  
  // Go to all cases
  await page.goto("/cases");
  await page.getByTestId("case-row-REC-2484").click();
  
  // Verify policy details
  await expect(page.getByText("Promise-to-pay is active")).toBeVisible();
  await page.getByRole("button", { name: "Action blocked by policy" }).click();
  // It shouldn't navigate or execute, the button should just be disabled or blocked
  await expect(page.getByRole("button", { name: "Action blocked by policy" })).toBeDisabled();
});

test("a judge can execute a bounded recovery action", async ({ page }) => {
  await page.goto("/cases/REC-2439");
  await page.getByRole("button", { name: "Approve & execute bounded action" }).click();
  await expect(page.getByText("Promise-to-pay recorded", { exact: false })).toBeVisible();
});

test("workspace navigation and demo controls give visible feedback", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Launch workspace", exact: true }).click();
  await expect(page).toHaveURL(/.*dashboard/);
});
