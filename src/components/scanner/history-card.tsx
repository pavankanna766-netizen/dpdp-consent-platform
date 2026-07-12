"use client";

import {
  useScanHistory,
} from "./use-scan-history";

export function HistoryCard() {
  const {
    data,
    isLoading,
    error,
  } =
    useScanHistory();

  if (isLoading) {
    return (
      <div className="rounded-xl border p-5">
        Loading history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border p-5">
        Failed to load history.
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="rounded-xl border p-5">
        No scans yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-5">
      <h2 className="mb-4 font-semibold">
        Recent Scans
      </h2>

      <div className="space-y-3">
        {data.map(
          (scan) => (
            <div
              key={scan.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <div className="font-medium">
                  {scan.url}
                </div>

                <div className="text-sm text-muted-foreground">
                  {new Date(
                    scan.created_at
                  ).toLocaleString()}
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold">
                  {scan.overall_score}
                </div>

                <div className="text-xs text-muted-foreground">
                  Score
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}