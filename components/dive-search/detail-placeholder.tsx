export function DetailPlaceholder() {
  return (
    <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center text-muted-foreground">
      <p className="text-sm">목적지를 선택하면</p>
      <p className="text-sm">여기에 예상 견적이 표시됩니다.</p>
    </div>
  );
}
