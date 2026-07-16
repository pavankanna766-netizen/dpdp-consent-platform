interface Props {
  items: {
    id: string;

    title: string;

    impact: number;

    type: string;
  }[];
}

export function ScoreBreakdown({
  items,
}: Props) {
  return (
    <div className="rounded-xl border p-6">

      <h2 className="font-semibold">
        Score Breakdown
      </h2>

      <div className="mt-5 space-y-3">

        {items.map(
          (item) => (
            <div
              key={item.id}
              className="flex justify-between"
            >
              <div>
                {item.title}
              </div>

              <div
                className={
                  item.impact > 0
                    ? "font-semibold text-red-600"
                    : "font-semibold text-slate-500"
                }
              >
                {item.impact > 0
                  ? `-${item.impact}`
                  : "Informational"}
              </div>
            </div>
          )
        )}

      </div>

    </div>
  );
}
