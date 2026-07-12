interface Props {
  changes: {
    type:
      | "added"
      | "removed"
      | "changed";

    title: string;

    description: string;

    severity:
      | "low"
      | "medium"
      | "high";
  }[];
}

export function ChangeSummary({
  changes,
}: Props) {
  if (
    changes.length === 0
  ) {
    return null;
  }

  return (
    <div className="rounded-xl border p-5">
      <h3 className="font-semibold">
        Changes Since Last Scan
      </h3>

      <div className="mt-4 space-y-3">
  {changes.map(
    (
      change,
      index
    ) => (
      <div
        key={index}
        className="rounded-lg border p-3"
      >
        <div className="flex items-center justify-between">
          <div className="font-medium">
            {change.title}
          </div>

          <span className="text-xs uppercase">
            {
              change.type
            }
          </span>
        </div>

        <div className="mt-2 text-sm text-muted-foreground">
          {
            change.description
          }
        </div>
      </div>
    )
  )}
</div>
    </div>
  );
}