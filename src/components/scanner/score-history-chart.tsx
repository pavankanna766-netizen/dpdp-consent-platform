interface Props {
  history: {
    id: string;

    score: number;

    createdAt: string;
  }[];
}

export function ScoreHistoryChart({
  history,
}: Props) {
  const max =
    Math.max(
      100,
      ...history.map(
        (h) => h.score
      )
    );

  return (
    <div className="rounded-xl border p-5">
      <h3 className="font-semibold">
        Score History
      </h3>

      <div className="mt-6 flex h-36 items-end gap-2">
        {history.map(
          (point) => (
            <div
              key={point.id}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div
                className="w-full rounded bg-blue-500"
                style={{
                  height: `${
                    (point.score /
                      max) *
                    100
                  }%`,
                }}
              />

              <div className="text-xs text-muted-foreground">
                {new Date(
                  point.createdAt
                ).toLocaleDateString()}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}