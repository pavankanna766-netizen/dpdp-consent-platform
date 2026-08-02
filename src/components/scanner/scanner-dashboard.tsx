"use client";

import { useEffect, useState } from "react";
import { useScanner } from "./scanner-context";
import { useScanProgress } from "./use-scan-progress";
import { ValidationTable } from "./validation-table";

interface SummaryResponse {
  scan: {
    id: string;
    url: string;
    status: string;
    overall_score: number;
    completed_at: string | null;
  };
  summary: {
    overview: {
      totalCookies: number;
      unclassifiedCookies: number;
      totalTrackers: number;
      totalFindings: number;
    };
    categoryBreakdown: Record<string, number>;
  };
  findings: Array<{
    id: string;
    title: string;
    description: string;
    severity: "critical" | "high" | "medium" | "low";
  }>;
  cookies: Array<{
    name: string;
    domain: string;
    category: string;
  }>;
}

export function ScannerDashboard() {
  const { selectedScanId, setSelectedScanId, refreshKey } = useScanner();
  const progress = useScanProgress(selectedScanId ?? undefined);

  const [data, setData] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingLatest, setIsLoadingLatest] = useState(!selectedScanId);

  useEffect(() => {
    let isMounted = true;

    async function loadLatest() {
      try {
        const latest = await fetch("/api/scanner/latest");

        if (!latest.ok) {
          if (isMounted) setIsLoadingLatest(false);
          return;
        }

        const json = await latest.json();
        const scan = json.data ?? json;

        if (scan && scan.id && isMounted) {
          setSelectedScanId(scan.id);
        }
      } catch (e) {
        console.error("Failed to load latest scan", e);
      } finally {
        if (isMounted) setIsLoadingLatest(false);
      }
    }

    if (!selectedScanId) {
      loadLatest();
    }
    return () => {
      isMounted = false;
    };
  }, [selectedScanId, setSelectedScanId, refreshKey]);

  useEffect(() => {
    if (!selectedScanId) {
      return;
    }

    async function loadSummary() {
      try {
        setError(null);

        const response = await fetch(`/api/scanner/${selectedScanId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch scan results.");
        }

        const json = await response.json();
        setData(json.data ?? json);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load scan summary.";
        setError(msg);
      }
    }

    loadSummary();
  }, [selectedScanId, refreshKey]);

  if (isLoadingLatest && !selectedScanId) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        Loading latest privacy scan audit...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mt-6 rounded-xl border border-dashed p-8 text-center text-gray-500">
        No active scan selected. Run a scan above to view compliance metrics.
      </div>
    );
  }

  const { scan, summary, findings } = data;
  const isRunning = scan.status === "running" || scan.status === "pending";

  return (
    <div className="mt-6 space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">Privacy Score</div>
          <div className="mt-2 text-3xl font-extrabold text-black">{scan.overall_score}/100</div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">Total Cookies</div>
          <div className="mt-2 text-3xl font-extrabold text-black">{summary.overview.totalCookies}</div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">Trackers Found</div>
          <div className="mt-2 text-3xl font-extrabold text-black">{summary.overview.totalTrackers}</div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-500 uppercase">Active Findings</div>
          <div className="mt-2 text-3xl font-extrabold text-black">{findings.length}</div>
        </div>
      </div>

      {isRunning && progress && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          <div className="flex justify-between font-semibold">
            <span>Audit Stage: {progress.stage}</span>
            <span>{progress.progress}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-blue-200">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Validation Table */}
      <ValidationTable
        websites={[
          { name: "Scanned Domain Target", url: scan.url },
        ]}
      />
    </div>
  );
}
