interface Props {
  policy: {
    id: string;
    version: number;
    status: string;
  } | null;

  companySlug: string;
  actions: React.ReactNode;
}

export function PolicyHeader({
  policy,
  actions
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-6">

      <div className="flex items-start justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Privacy Policy
          </h1>

          {policy && (
            <div className="mt-3 flex gap-6 text-sm text-muted-foreground">

              <span>
                Version {policy.version}
              </span>

              <span>
                {policy.status}
              </span>

            </div>
          )}

        </div>

        <div className="flex gap-3">

          {actions}

        </div>

      </div>

    </div>
  );
}