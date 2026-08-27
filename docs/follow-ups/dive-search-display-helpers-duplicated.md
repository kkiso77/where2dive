# dive-search 컴포넌트 간 표시 포맷 헬퍼 중복

**Symptom**: `formatMan`, `formatRange`, `flightRouteLabel` 함수와 다이빙 횟수 스테퍼 UI가 `destination-card.tsx`, `detail-panel.tsx`, `compare-overlay.tsx`, `filter-bar.tsx`에 거의 동일하게 각각 재정의되어 있다.

**Observed evidence**: `code-review low` 1회 실행 결과, 위 4개 컴포넌트에서 동일 로직의 중복 정의를 확인.

**Suspected cause**: Task 01～03을 순서대로 구현하면서 각 화면 조각에 필요한 표시 로직을 그때그때 인라인으로 작성하고, 공용 모듈로 추출하는 단계를 건너뛰었다.

**What was tried**: 이번 세션의 검증·리뷰 예산(수용 기준을 깨거나 주 경로를 실제로 망가뜨리는 것만 고침) 범위 밖이라 지금은 고치지 않았다. 4곳 모두 현재는 값이 일치해 화면 표시에 문제는 없다.

**Proposed next step**: `formatMan`/`formatRange`/`flightRouteLabel`을 `lib/destinations`(또는 `components/dive-search`의 공용 유틸 파일)로 추출하고, 다이빙 횟수 스테퍼를 `DiveCountStepper` 같은 공용 컴포넌트로 뽑아 `filter-bar.tsx`와 `detail-panel.tsx`가 함께 쓰게 한다.
