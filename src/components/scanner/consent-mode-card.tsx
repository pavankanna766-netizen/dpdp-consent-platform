interface Props {
  consentMode: {
    status: string;

    implementation: string;

    score: number;

    checks: {
      name: string;

      passed: boolean;
    }[];
  };
}

export function ConsentModeCard({
  consentMode,
}: Props) {
  return (
    <div className="rounded-xl border p-6">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-lg font-semibold">
            Google Consent Mode
          </h2>

          <div className="text-sm text-muted-foreground">
            {consentMode.implementation}
          </div>

        </div>

        <div className="text-4xl font-bold">
          {consentMode.score}
        </div>

      </div>

      <div className="mt-6 space-y-3">

        {consentMode.checks.map(
          (check) => (
            <div
              key={check.name}
              className="flex items-center justify-between"
            >
              <span>
                {check.name}
              </span>

              <span
                className={
                  check.passed
                    ? "text-green-600 font-medium"
                    : "text-red-600 font-medium"
                }
              >
                {check.passed
                  ? "✓"
                  : "✗"}
              </span>
            </div>
          )
        )}

      </div>

    </div>
  );
}