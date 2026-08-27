import { expect, test } from "@playwright/test";

test.describe("시기별 후보지 탐색", () => {
  test("지역 필터를 지정하면 지도와 목록에 그 지역 목적지만 나타난다", async ({ page }) => {
    await page.goto("/");

    await page.getByLabel("지역").selectOption("필리핀");

    const list = page.locator("[data-destination-id]");
    await expect(list).toHaveCount(3);
    for (const id of await list.evaluateAll((els) => els.map((el) => el.getAttribute("data-destination-id")))) {
      expect(["anilao", "cebu-moalboal", "bohol"]).toContain(id);
    }
  });

  test("다이빙 스타일을 선택하면 지도 마커와 카드 수가 함께 줄어든다", async ({ page }) => {
    await page.goto("/");

    const before = await page.locator("[data-destination-id]").count();
    await page.getByRole("button", { name: "대물", exact: true }).click();

    await expect(page.locator("[data-destination-id]")).toHaveCount(8);
    expect(await page.locator(".leaflet-marker-icon").count()).toBeLessThan(before);
  });

  test("만족하는 목적지가 없으면 빈 결과 안내가 나오고 초기화로 복구된다", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "대물", exact: true }).click();
    await page.getByRole("button", { name: "매크로", exact: true }).click();
    await page.getByRole("button", { name: "드리프트", exact: true }).click();

    await expect(page.getByText("조건에 맞는 목적지가 없습니다")).toBeVisible();

    await page.getByRole("button", { name: "필터 초기화" }).click();

    await expect(page.getByText("조건에 맞는 목적지가 없습니다")).toHaveCount(0);
  });

  test("카드를 클릭하면 대응하는 지도 마커가 선택 상태로 바뀐다", async ({ page }) => {
    await page.goto("/");

    await page.locator('[data-destination-id="sipadan"]').scrollIntoViewIfNeeded();
    await page.locator('[data-destination-id="sipadan"]').click();

    await expect
      .poll(() =>
        page
          .locator(".leaflet-marker-icon")
          .evaluateAll((els) => els.filter((el) => el.innerHTML.includes("outline")).length)
      )
      .toBe(1);
  });

  test("국가 그룹 헤더를 클릭하면 접혔다가 다시 펼쳐진다", async ({ page }) => {
    await page.goto("/");

    const header = page.getByRole("button", { name: /필리핀\s*3곳/ });
    await expect(header).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator('[data-destination-id="anilao"]')).toBeVisible();

    await header.click();
    await expect(header).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator('[data-destination-id="anilao"]')).toHaveCount(0);

    await header.click();
    await expect(page.locator('[data-destination-id="anilao"]')).toBeVisible();
  });

  test("8월에는 추천 구획과 비추천 구획이 함께 나타나고 등급 이유가 표시된다", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("여행 월").selectOption("8");

    await expect(page.getByText("추천 목적지", { exact: true })).toBeVisible();
    await expect(page.getByText("이번 달 비추천 목적지")).toBeVisible();
    await expect(
      page.locator('[data-destination-id="similan"]').getByText(/국립공원이 폐쇄/)
    ).toBeVisible();
  });

  test("각 목적지의 다이빙샵 정보는 구글맵 링크로 연결된다", async ({ page }) => {
    await page.goto("/");

    const link = page.locator('[data-destination-id="anilao"] a');
    await expect(link).toHaveAttribute("href", /google\.com\/maps/);
    await expect(link).toHaveAttribute("target", "_blank");
  });
});
