interface Props {
  severity:
    | "info"
    | "critical"
    | "high"
    | "medium"
    | "low";
}

export function SeverityBadge({
  severity,
}: Props) {
  const styles = {
    info:
      "bg-slate-100 text-slate-700",

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
