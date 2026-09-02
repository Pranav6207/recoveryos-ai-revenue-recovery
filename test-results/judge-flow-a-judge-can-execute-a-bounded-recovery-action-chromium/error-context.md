# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: judge-flow.spec.ts >> a judge can execute a bounded recovery action
- Location: tests\e2e\judge-flow.spec.ts:18:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Promise-to-pay recorded')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Promise-to-pay recorded')

```

```yaml
- banner:
  - link "RecoveryOSTest Mode":
    - /url: /dashboard
  - navigation:
    - link "Dashboard":
      - /url: /dashboard
    - link "Cases":
      - /url: /cases
    - link "Playbooks":
      - /url: /playbooks/payment_degradation
    - link "Operations":
      - /url: /operations
    - link "Integration lab":
      - /url: /integration-lab
    - link "Verification":
      - /url: /verification
- main:
  - paragraph: Case Details
  - heading "REC-2439" [level=1]
  - text: at risk ₹35,698 at risk
  - paragraph: AI diagnosis
  - paragraph: Synthetic signals only · policy still has final authority
  - text: Simulated
  - button "Refresh diagnosis"
  - paragraph: Root cause
  - paragraph: Awaiting LLM diagnosis...
  - paragraph: Recommendation
  - paragraph: Awaiting recommendation via Email
  - blockquote: “...”
  - button "Explainable AI Trace"
  - paragraph: Action is within recovery policy
  - paragraph: Consent, contact limits, payment state, and stop conditions all pass.
  - paragraph: "Next: A reviewer may approve the bounded action below."
  - paragraph: Bounded recovery action
  - paragraph: "Current status: at risk"
  - paragraph: Consent, contact limits, payment state, and stop conditions all pass.
  - button "Approve & execute bounded action"
  - status: Policy-controlled simulated action completed.
  - complementary:
    - heading "Audit Evidence" [level=3]
    - list:
      - listitem:
        - paragraph: Action is within recovery policy
        - text: Simulated
        - paragraph: Consent, contact limits, payment state, and stop conditions all pass.
        - paragraph: Today, 10:15
      - listitem:
        - paragraph: AI diagnosis completed
        - text: Simulated
        - paragraph: Invoice is 14 days overdue with no dispute or partial payment. The value is high enough to prioritize a supervised, immediate recovery path.
        - paragraph: Today, 10:15
      - listitem:
        - paragraph: Risk signal ingested
        - text: Simulated
        - paragraph: Invoice INV-842 is overdue; last reminder was acknowledged.
        - paragraph: Today, 10:14
- alert
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | test("a judge can inspect recovery value and a policy block", async ({ page }) => {
  4  |   await page.goto("/dashboard");
  5  |   await expect(page.getByRole("heading", { name: /Turn risk signals into recovered revenue/i })).toBeVisible();
  6  |   
  7  |   // Go to all cases
  8  |   await page.goto("/cases");
  9  |   await page.getByTestId("case-row-REC-2484").click();
  10 |   
  11 |   // Verify policy details
  12 |   await expect(page.getByText("Promise-to-pay is active")).toBeVisible();
  13 |   await page.getByRole("button", { name: "Action blocked by policy" }).click();
  14 |   // It shouldn't navigate or execute, the button should just be disabled or blocked
  15 |   await expect(page.getByRole("button", { name: "Action blocked by policy" })).toBeDisabled();
  16 | });
  17 | 
  18 | test("a judge can execute a bounded recovery action", async ({ page }) => {
  19 |   await page.goto("/cases/REC-2439");
  20 |   await page.getByRole("button", { name: "Approve & execute bounded action" }).click();
> 21 |   await expect(page.getByText("Promise-to-pay recorded", { exact: false })).toBeVisible();
     |                                                                             ^ Error: expect(locator).toBeVisible() failed
  22 | });
  23 | 
  24 | test("workspace navigation and demo controls give visible feedback", async ({ page }) => {
  25 |   await page.goto("/");
  26 | 
  27 |   await page.getByRole("button", { name: "Launch workspace", exact: true }).click();
  28 |   await expect(page).toHaveURL(/.*dashboard/);
  29 | });
  30 | 
```