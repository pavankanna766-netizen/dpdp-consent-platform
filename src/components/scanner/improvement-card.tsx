interface Props {
  change: number;
}

export function ImprovementCard({
  change,
}: Props) {
  return (
    <div className="rounded-xl border p-5">

      <div className="text-sm text-muted-foreground">
        Improvement
      </div>

      <div
        className={`mt-3 text-3xl font-bold ${
          change >= 0
            ? "text-green-600"
            : "text-red-600"
        }`}
      >
        {change >= 0
          ? `+${change}`
          : change}
      </div>

    </div>
  );
}