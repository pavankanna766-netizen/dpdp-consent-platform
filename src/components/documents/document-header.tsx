import type { ReactNode } from "react";

interface Props {
  title: string;

  version?: number;

  status?: string;

  actions?: ReactNode;
}

export function DocumentHeader({
  title,
  version,
  status,
  actions,
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {title}
          </h1>

          {version && (
            <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
              <span>
                Version {version}
              </span>

              <span>
                {status}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {actions}
        </div>
      </div>
    </div>
  );
}