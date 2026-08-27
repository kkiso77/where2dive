import { expect, test } from "@playwright/test";

test.describe("후보지 나란히 비교", () => {
  test("두 곳을 비교함에 담으면 나란히 비교 화면을 열 수 있다", async ({ page }) => {
    await page.goto("/");

    await page.locator('[data-destination-id="anilao"]').getByText("비교").click();
    await page.locator('[data-destination-id="sipadan"]').getByText("비교").click();

    const compareButton = page.getByRole("button", { name: "나란히 비교" });
    await expect(compareButton).toBeEnabled();
    await compareButton.click();

    await expect(page.getByRole("heading", { name: "후보지 비교" })).toBeVisible();
    await expect(page.getByRole("row", { name: /예상 총액/ })).toContainText("약 106만원");
    await expect(page.getByRole("row", { name: /예상 총액/ })).toContainText("약 163만원");
  });

  test("한 곳만 담으면 나란히 비교 버튼이 비활성 상태다", async ({ page }) => {
    await page.goto("/");

    await page.locator('[data-destination-id="anilao"]').getByText("비교").click();

    await expect(page.getByRole("button", { name: "나란히 비교" })).toBeDisabled();
  });

  test("조건을 바꿔도 비교 대상이 유지되고, 후보에서 완전히 빠진 목적지에는 표시가 붙는다", async ({ page }) => {
    await page.goto("/");

    await page.locator('[data-destination-id="anilao"]').getByText("비교").click();
    await page.locator('[data-destination-id="sipadan"]').getByText("비교").click();
    await page.getByRole("button", { name: "나란히 비교" }).click();
    await page.getByRole("button", { name: "닫기" }).click();

    await page.getByLabel("지역").selectOption("필리핀");

    await page.getByRole("button", { name: "나란히 비교" }).click();
    await expect(page.getByText("현재 조건에서 후보 아님")).toBeVisible();
  });

  test("8월에 조건이 안 맞아 비추천으로 바뀐 목적지는 필터로 걸러진 경우와 다르게 표시된다", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("여행 월").selectOption("8");

    await page.locator('[data-destination-id="anilao"]').getByText("비교").click();
    await page.locator('[data-destination-id="similan"]').getByText("비교").click();
    await page.getByRole("button", { name: "나란히 비교" }).click();

    await expect(page.getByText("이번 달 비추천", { exact: true })).toBeVisible();
    await expect(page.getByText("현재 조건에서 후보 아님")).toHaveCount(0);
  });

  test("비교함에서 제거해 한 곳만 남으면 비교 화면이 닫힌다", async ({ page }) => {
    await page.goto("/");

    await page.locator('[data-destination-id="anilao"]').getByText("비교").click();
    await page.locator('[data-destination-id="sipadan"]').getByText("비교").click();
    await page.getByRole("button", { name: "나란히 비교" }).click();

    await page.getByRole("button", { name: "시파단 · 마부 비교에서 빼기" }).click();

    await expect(page.getByRole("heading", { name: "후보지 비교" })).toHaveCount(0);
  });
});
