interface Props {
  score: number;
}

export function StatusChip({
  score,
}: Props) {

  const label =
    score >= 85
      ? "Excellent"

      : score >= 70
      ? "Good"

      : score >= 50
      ? "Needs Attention"

      : "Critical";

  const color =
    score >= 85
      ? "bg-green-100 text-green-700"

      : score >= 70
      ? "bg-blue-100 text-blue-700"

      : score >= 50
      ? "bg-yellow-100 text-yellow-700"

      : "bg-red-100 text-red-700";

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-semibold ${color}`}
    >
      {label}
    </span>
  );
}