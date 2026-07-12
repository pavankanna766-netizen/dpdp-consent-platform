interface ExecutiveSummaryCardProps {
  title: string;

  summary: string;

  risk:
    | "Low"
    | "Moderate"
    | "High"
    | "Critical";
}

const COLORS = {
  Low: "bg-green-100 text-green-700",

  Moderate:
    "bg-yellow-100 text-yellow-700",

  High:
    "bg-orange-100 text-orange-700",

  Critical:
    "bg-red-100 text-red-700",
};

export function ExecutiveSummaryCard({
  title,
  summary,
  risk,
}: ExecutiveSummaryCardProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {title}
        </h2>

        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${COLORS[risk]}`}
        >
          {risk} Risk
        </span>
      </div>

      <p className="leading-7 text-muted-foreground">
        {summary}
      </p>
    </div>
  );
}