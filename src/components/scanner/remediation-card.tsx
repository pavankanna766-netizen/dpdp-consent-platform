interface Props {
  severity:
    | "critical"
    | "high"
    | "medium"
    | "low";

  title: string;

  recommendation: string;
}

const COLORS = {
  critical:
    "border-red-500 bg-red-50",

  high:
    "border-orange-500 bg-orange-50",

  medium:
    "border-yellow-500 bg-yellow-50",

  low:
    "border-green-500 bg-green-50",
};

const SCORE_GAIN = {
  critical: 20,
  high: 15,
  medium: 8,
  low: 4,
};

export function RemediationCard({
  severity,
  title,
  recommendation,
}: Props) {
  return (
    <div
      className={`rounded-xl border-l-4 p-5 ${COLORS[severity]}`}
    >
      <div className="flex items-center justify-between">

        <h3 className="font-semibold">
          {title}
        </h3>

        <span className="rounded-full bg-white px-3 py-1 text-sm">
          +{SCORE_GAIN[severity]}
        </span>

      </div>

      <p className="mt-3 text-sm text-gray-700">
        {recommendation}
      </p>

      <div className="mt-4 text-xs font-medium text-gray-500">
        Estimated Privacy Score Improvement
      </div>
    </div>
  );
}