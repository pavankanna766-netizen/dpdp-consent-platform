export default function ConsentsLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading consents">
      <div className="h-20 animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-36 animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
