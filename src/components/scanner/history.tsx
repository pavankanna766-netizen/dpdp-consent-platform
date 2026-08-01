"use client";

import { useScanner } from "./scanner-context";
import { useScanHistory } from "./use-scan-history";

export function ScanHistory() {
  const { data, isLoading } = useScanHistory();
  const { selectedScanId, setSelectedScanId } = useScanner();

  function formatUrl(url: string) {
    return url
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "");
  }

  const history = data ?? [];

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-white p-5 shadow-sm text-sm text-gray-500 animate-pulse">
        Loading recent scans...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Recent Scans
        </h2>
        <p className="text-sm text-muted-foreground">
          No scans yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Recent Scans
      </h2>

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {history.map((scan) => (
          <button
            key={scan.id}
            onClick={() => setSelectedScanId(scan.id)}
            className={`w-full rounded-lg border p-3 text-left transition ${
              selectedScanId === scan.id
                ? "border-black bg-slate-50 font-medium"
                : "hover:bg-slate-50 border-gray-200"
            }`}
          >
            <div className="font-medium truncate text-sm text-gray-900">
              {formatUrl(scan.url)}
            </div>

            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span className="capitalize">
                {scan.status === "completed"
                  ? "Completed"
                  : scan.status === "running"
                  ? "Running..."
                  : scan.status}
              </span>

              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  scan.overall_score >= 85
                    ? "bg-green-100 text-green-700"
                    : scan.overall_score >= 60
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {scan.overall_score}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}