export function LoadingState() {
  return (
    <div className="rounded-xl border p-10 text-center">
      <div className="animate-pulse space-y-4">
  <div className="h-10 w-64 rounded bg-muted" />

  <div className="grid grid-cols-4 gap-4">
    <div className="h-32 rounded bg-muted" />
    <div className="h-32 rounded bg-muted" />
    <div className="h-32 rounded bg-muted" />
    <div className="h-32 rounded bg-muted" />
  </div>
</div>
    </div>
  );
}