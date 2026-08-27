import { expect, test } from "@playwright/test";

test.describe("지도·목록·상세 레이아웃", () => {
  test("넓은 화면에서 지도·목록·상세가 좌우 3등분으로 나란히 배치된다", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 800 });
    await page.goto("/");
    await page.waitForSelector(".leaflet-container");

    await page.locator('[data-destination-id="anilao"]').click();

    const map = await page.getByTestId("map-panel").boundingBox();
    const list = await page.locator('[data-destination-id="anilao"]').boundingBox();
    const panel = await page.getByTestId("detail-panel").boundingBox();

    expect(map).not.toBeNull();
    expect(list).not.toBeNull();
    expect(panel).not.toBeNull();
    if (!map || !list || !panel) return;

    // 세 칸이 세로로 겹치지 않고 좌→중→우 순서로 나란히 있어야 한다.
    expect(list.x).toBeGreaterThan(map.x + map.width - 10);
    expect(panel.x).toBeGreaterThan(list.x);
  });

  test("문서 끝까지 스크롤해도 지도와 상세 패널이 각자 화면 안에 유지된다", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 800 });
    await page.goto("/");
    await page.waitForSelector(".leaflet-container");

    await page.locator('[data-destination-id="anilao"]').click();
    await page.mouse.wheel(0, 100000);
    await page.waitForTimeout(300);

    const map = await page.getByTestId("map-panel").boundingBox();
    const panel = await page.getByTestId("detail-panel").boundingBox();

    expect(map).not.toBeNull();
    expect(panel).not.toBeNull();
    if (!map || !panel) return;

    expect(map.y).toBeGreaterThanOrEqual(0);
    expect(map.y).toBeLessThan(800);
    expect(panel.y).toBeGreaterThanOrEqual(0);
    expect(panel.y).toBeLessThan(800);
  });

  test("헤더와 필터바는 목록을 스크롤해도 화면 위에 고정되고, 지도는 그 아래에서 겹치지 않는다", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 800 });
    await page.goto("/");
    await page.waitForSelector(".leaflet-container");

    const filterBarBefore = await page.getByLabel("여행 월").boundingBox();
    await page.mouse.wheel(0, 1500);
    await page.waitForTimeout(200);
    const filterBarAfter = await page.getByLabel("여행 월").boundingBox();
    const map = await page.getByTestId("map-panel").boundingBox();

    expect(filterBarBefore).not.toBeNull();
    expect(filterBarAfter).not.toBeNull();
    expect(map).not.toBeNull();
    if (!filterBarBefore || !filterBarAfter || !map) return;

    // 필터바는 스크롤해도 화면 위쪽 근처에 계속 보이고(사라지지 않고), 지도는 그 아래에서 시작해 겹치지 않는다.
    expect(filterBarAfter.y).toBeGreaterThanOrEqual(0);
    expect(filterBarAfter.y).toBeLessThan(filterBarBefore.y);
    expect(map.y).toBeGreaterThanOrEqual(filterBarAfter.y + filterBarAfter.height);
  });

  test("모바일 화면에서는 지도 아래로 목록과 상세가 순서대로 세로로 쌓인다", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForSelector(".leaflet-container");

    await page.locator('[data-destination-id="anilao"]').click();

    const map = await page.getByTestId("map-panel").boundingBox();
    const panel = await page.getByTestId("detail-panel").boundingBox();

    expect(map).not.toBeNull();
    expect(panel).not.toBeNull();
    if (!map || !panel) return;

    expect(map.width).toBeGreaterThan(300);
    expect(panel.y).toBeGreaterThan(map.y);
  });
});
