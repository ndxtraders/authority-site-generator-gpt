import { expect, test } from "@playwright/test";

test.describe("H.6 browser regression coverage", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("mobile navigation is keyboard-operable and closes on Escape and selection", async ({
    page,
  }) => {
    await page.goto("/");

    const toggle = page.getByRole("button", { name: "Open menu" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("navigation", { name: "Mobile" })).toHaveCount(0);

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(toggle).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(page.getByRole("navigation", { name: "Mobile" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    await page.keyboard.press("Space");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "About", exact: true })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  test("contact form exposes field validation and delivery-error states", async ({ page }) => {
    await page.goto("/contact");
    const formAlert = page.locator("form [role='alert']");

    await page.getByLabel("Name").fill("Ada Lovelace");
    await page.getByLabel("Phone").fill("12345");
    await page.getByLabel("Email").fill("ada@example.com");
    await page.getByLabel("How can we help?").fill("I need help with a project.");
    await page.waitForTimeout(1_600);
    const submissionId = await page.locator("input[name='submissionId']").inputValue();
    await page.getByRole("button", { name: "Request a Free Estimate" }).click();

    await expect(formAlert).toContainText(
      "Please check the highlighted fields",
    );
    await expect(page.getByLabel("Phone")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("Enter a valid phone number with 10 to 15 digits.")).toBeVisible();
    await expect(page.locator("input[name='submissionId']")).toHaveValue(submissionId);
    await expect(page.locator("input[name='startedAt']")).not.toHaveValue("");

    // React clears uncontrolled values after the completed Server Action. Re-entering
    // them exercises a genuine retry while the stable hidden idempotency value persists.
    await page.getByLabel("Name").fill("Ada Lovelace");
    await page.getByLabel("Phone").fill("(209) 555-0148");
    await page.getByLabel("Email").fill("ada@example.com");
    await page.getByLabel("How can we help?").fill("I need help with a project.");
    await page.getByRole("button", { name: "Request a Free Estimate" }).click();

    await expect(formAlert).toContainText(
      "This form isn't connected to a lead inbox yet",
    );
    await expect(page).toHaveURL(/\/contact$/);
  });
});
