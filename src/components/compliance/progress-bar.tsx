interface Props {
  value: number;
}

export function ProgressBar({
  value,
}: Props) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-emerald-600 transition-all"
        style={{
          width: `${value}%`,
        }}
      />
    </div>
  );
}