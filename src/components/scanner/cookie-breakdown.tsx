interface Props {
  necessary: number;
  analytics: number;
  marketing: number;
  preferences: number;
}

export function CookieBreakdown({
  necessary,
  analytics,
  marketing,
  preferences,
}: Props) {
  const total =
    necessary +
    analytics +
    marketing +
    preferences;

  const rows = [
    {
      label: "Necessary",
      value: necessary,
      color: "bg-green-500",
    },
    {
      label: "Analytics",
      value: analytics,
      color: "bg-blue-500",
    },
    {
      label: "Marketing",
      value: marketing,
      color: "bg-red-500",
    },
    {
      label: "Preferences",
      value: preferences,
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <h2 className="mb-6 text-lg font-semibold">
        Cookie Breakdown
      </h2>

      <div className="space-y-4">
        {rows.map((row) => {
          const percent =
            total === 0
              ? 0
              : Math.round(
                  (row.value /
                    total) *
                    100
                );

          return (
            <div
              key={row.label}
            >
              <div className="mb-1 flex justify-between text-sm">
                <span>
                  {row.label}
                </span>

                <span>
                  {row.value}
                </span>
              </div>

              <div className="h-3 rounded-full bg-gray-200">
                <div
                  className={`${row.color} h-3 rounded-full transition-all duration-700`}
                  style={{
                    width: `${percent}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}