"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useScanner,
} from "./scanner-context";

interface ScanHistoryItem {
  id: string;
  url: string;
  overall_score: number;
  status: string;
  created_at: string;
}

export function ScanHistory() {
  const [history, setHistory] =
    useState<ScanHistoryItem[]>([]);

   function formatUrl(
  url: string
) {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

  const {
    selectedScanId,
    setSelectedScanId,
    refreshKey,
  } = useScanner();

  useEffect(() => {
    async function loadHistory() {
      const response =
        await fetch(
          "/api/scanner/history"
        );

      if (!response.ok) {
        return;
      }

      const json =
        await response.json();

      setHistory(json);
    }

    loadHistory();
  }, [refreshKey]);

  if (history.length === 0) {
  return (
    <div className="rounded-xl border p-5">
      <h2 className="mb-3 text-lg font-semibold">
        Recent Scans
      </h2>

      <p className="text-sm text-muted-foreground">
        No scans yet.
      </p>
    </div>
  );
}

  return (
    <div className="rounded-xl border p-5">
      <h2 className="mb-4 text-lg font-semibold">
        Recent Scans
      </h2>

      <div className="space-y-2">
        {history.map((scan) => (
          <button
            key={scan.id}
            onClick={() =>
              setSelectedScanId(
                scan.id
              )
            }
            className={`w-full rounded-lg border p-3 text-left transition ${
              selectedScanId ===
              scan.id
                ? "border-primary bg-primary/10"
                : ""
            }`}
          >
            <div className="font-medium truncate">
              {formatUrl(scan.url)}
            </div>

            <div className="mt-1 flex justify-between text-sm text-muted-foreground">
              <span>
                {scan.status === "completed"
  ? "Completed"
  : scan.status === "running"
  ? "Running"
  : scan.status}
              </span>

              <span
  className={`rounded-full px-2 py-1 text-xs font-semibold ${
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