interface EmptyStateProps {
  onReset: () => void;
}

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed p-14 text-center text-muted-foreground">
      <h3 className="mb-1.5 text-base font-semibold text-foreground">
        조건에 맞는 목적지가 없습니다
      </h3>
      <p className="mx-auto mb-4 max-w-md text-sm">
        선택한 지역·다이빙 스타일 조합을 만족하는 동남아 목적지가 없습니다. 스타일 필터를
        줄이거나 지역을 &ldquo;전체&rdquo;로 넓혀보세요.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="h-9 rounded-md border bg-background px-4 text-sm font-medium hover:bg-muted"
      >
        필터 초기화
      </button>
    </div>
  );
}
