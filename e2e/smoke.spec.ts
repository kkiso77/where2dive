import { expect, test } from "@playwright/test";

test("홈 화면이 열리고 서비스 제목과 필터가 보인다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Where2Dive");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Where2Dive");
  await expect(page.getByText("여행 월")).toBeVisible();
});
