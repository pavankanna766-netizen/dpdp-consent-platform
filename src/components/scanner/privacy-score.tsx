interface Props {
  score: number;
}



export function PrivacyScore({
  score,
}: Props) {
    const color =
  score >= 85
    ? "bg-green-500"
    : score >= 60
    ? "bg-yellow-500"
    : "bg-red-500";
  return (
    
    <div className="rounded-xl border p-6">

      <div className="text-sm text-muted-foreground">
        Privacy Score
      </div>

      <div className="mt-3 flex items-end gap-2">

        <div className="text-6xl font-bold">
          {score}
        </div>

        <div className="pb-2 text-xl text-muted-foreground">
          /100
        </div>

      </div>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-200">

        <div
          style={{
            width: `${score}%`,
          }}
          className={`h-full ${color}`}
        />

      </div>

    </div>
  );
}