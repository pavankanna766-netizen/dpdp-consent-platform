interface Props {
  severity:
    | "critical"
    | "high"
    | "medium"
    | "low";
}

export function SeverityBadge({
  severity,
}: Props) {
  const styles = {
    critical:
      "bg-red-600 text-white",

    high:
      "bg-red-100 text-red-700",

    medium:
      "bg-yellow-100 text-yellow-700",

    low:
      "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[severity]}`}
    >
      {severity}
    </span>
  );
}