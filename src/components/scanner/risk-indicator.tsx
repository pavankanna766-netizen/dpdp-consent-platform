interface Props {
  risk: string;
}

export function RiskIndicator({
  risk,
}: Props) {
  const color =
    risk === "low"
      ? "bg-green-500"
      : risk === "medium"
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="flex items-center gap-2">

      <div
        className={`h-3 w-3 rounded-full ${color}`}
      />

      <span className="capitalize font-medium">
        {risk}
      </span>

    </div>
  );
}