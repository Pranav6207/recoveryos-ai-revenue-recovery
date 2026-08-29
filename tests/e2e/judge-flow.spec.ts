import { expect, test } from "@playwright/test";

test("a judge can inspect recovery value and a policy block", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Turn risk signals into recovered revenue/i })).toBeVisible();
  await expect(page.getByText("120-event synthetic batch")).toBeVisible();

  await page.getByTestId("case-row-REC-2484").click();
  await expect(page.getByTestId("policy-title")).toHaveText("Promise-to-pay is active");
  await page.getByRole("button", { name: "Show policy block in audit" }).click();
  await expect(page.getByText("Action blocked by policy")).toBeVisible();
});

test("a judge can execute a bounded recovery action", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("case-row-REC-2439").click();
  await page.getByRole("button", { name: "Approve & execute bounded action" }).click();
  await expect(page.getByText("Promise-to-pay recorded")).toBeVisible();
});

test("workspace navigation and demo controls give visible feedback", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Start demo", exact: true }).click();
  await expect(page.getByTestId("demo-status")).toContainText("Demo session started");
  await expect(page.getByTestId("demo-run-badge")).toContainText("day 1 · active");
  await expect(page.locator("header").getByRole("button", { name: "Restart demo", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Batch analytics", exact: true }).click();
  await expect(page.getByRole("button", { name: "Batch analytics", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByTestId("demo-status")).toContainText("Batch analytics opened");
});
