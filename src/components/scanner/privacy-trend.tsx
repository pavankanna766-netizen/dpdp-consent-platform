interface Props {
  current: number;

  previous: number | null;

  change: number;

  trend:
    | "up"
    | "down"
    | "same";
}

export function PrivacyTrend({
  current,
  previous,
  change,
  trend,
}: Props) {
  return (
    <div className="rounded-xl border p-6">

      <div className="flex justify-between items-center">

        <div>

          <div className="text-sm text-muted-foreground">
            Privacy Trend
          </div>

          <div className="mt-2 text-5xl font-bold">
            {current}
          </div>

        </div>

        <div
          className={`text-xl font-bold ${
            trend === "up"
              ? "text-green-600"
              : trend === "down"
              ? "text-red-600"
              : "text-gray-500"
          }`}
        >
          {change > 0
            ? `▲ +${change}`
            : change < 0
            ? `▼ ${change}`
            : "No Change"}
        </div>

      </div>

    </div>
  );
}