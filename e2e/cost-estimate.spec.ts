import { expect, test } from "@playwright/test";

test.describe("예상 견적 산출", () => {
  test("여행 기간을 5일로 입력하면 다이빙 횟수 기본값이 9로 제시된다", async ({ page }) => {
    await page.goto("/");

    await page.getByLabel("여행 기간").selectOption("5");

    await expect(page.getByLabel("다이빙 횟수", { exact: true }).first()).toHaveValue("9");
  });

  test("후보지를 선택하면 예상 견적이 항목별로 펼쳐진다", async ({ page }) => {
    await page.goto("/");

    await page.locator('[data-destination-id="sipadan"]').click();

    const panel = page.getByTestId("detail-panel");
    await expect(panel.getByText("다이빙 비용 · 멀티다이브 할인")).toBeVisible();
    await expect(panel.getByText("리브어보드", { exact: true })).toBeVisible();
    await expect(panel.getByText("항공", { exact: true })).toBeVisible();
    await expect(panel.getByText(/숙소 \(\d+박\)/)).toBeVisible();
    await expect(panel.getByText(/공항 → 다이빙 지역/)).toBeVisible();
  });

  test("다이빙 횟수를 구간 경계 위로 올리면 단가가 낮아지고 적용 구간이 표시된다", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-destination-id="sipadan"]').click();

    const panel = page.getByTestId("detail-panel");
    const diveCountInput = panel.getByLabel("다이빙 횟수", { exact: true });

    await diveCountInput.fill("2");
    await expect(panel.getByRole("row", { name: /^1～2회/ })).toContainText("현재 적용");

    await diveCountInput.fill("12");
    await expect(panel.getByRole("row", { name: /^10회 이상/ })).toContainText("현재 적용");
  });

  test("리브어보드가 있는 목적지는 리브어보드 이용 시 예상 총액이 육상 기준 총액과 별도로 표시된다", async ({ page }) => {
    await page.goto("/");

    await page.locator('[data-destination-id="sipadan"]').click();

    const panel = page.getByTestId("detail-panel");
    await expect(panel.getByText("리브어보드 이용 시 예상 총액")).toBeVisible();
    await expect(panel.getByText("예상 총액 (숙소 패키지 기준)")).toBeVisible();
  });

  test("리브어보드가 없는 목적지는 리브어보드 항목이 나타나지 않는다", async ({ page }) => {
    await page.goto("/");

    await page.locator('[data-destination-id="anilao"]').click();

    const panel = page.getByTestId("detail-panel");
    await expect(panel.getByText("리브어보드", { exact: true })).toHaveCount(0);
  });

  test("경유 목적지는 경유 공항과 최종 목적지 공항이 함께 표시된다", async ({ page }) => {
    await page.goto("/");

    await page.locator('[data-destination-id="raja-ampat"]').click();

    const panel = page.getByTestId("detail-panel");
    await expect(panel.getByText("인천 → 자카르타 경유 → 소롱")).toBeVisible();
    await expect(panel.getByText(/공항 → 다이빙 지역: 소롱 항에서/)).toBeVisible();
  });

  test("카드 목록의 각 후보지에 예상 총비용이 요약되어 나타난다", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.locator('[data-destination-id="anilao"]').getByText(/예상 총액약 \d+만원/)
    ).toBeVisible();
  });

  test("모든 금액에 조사 시점 기준 참고가라는 안내가 표시된다", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-destination-id="anilao"]').click();

    await expect(page.getByText(/조사 기준 참고가입니다/)).toBeVisible();
  });
});
