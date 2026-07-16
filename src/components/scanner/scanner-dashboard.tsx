"use client";

import { useEffect, useState } from "react";

import {
  HistoryCard,
  SummaryCard,
  PrivacyScore,
  TrackerTable,
  FindingsTable,
  DownloadPdfButton,
  LoadingState,
  EmptyState,
  ErrorState,
  ExecutiveSummaryCard,
  ScoreHistoryChart,
ImprovementCard,
PrivacyTrend,
StatusChip,
ProgressCard,
TechnologyStackCard,
ConsentModeCard,
ChangeSummary,
GenerateCookiePolicyButton,
} from "@/components/scanner";

import {
  useScanner,
} from "./scanner-context";

import {
  useScanProgress,
} from "./use-scan-progress";

interface SummaryResponse {
  dashboard: {
    score: number;
    cookies: number;
    trackers: number;
    findings: number;
    risk: string;
  };

  executiveSummary: {
    title: string;
    summary: string;
    risk:
      | "Low"
      | "Moderate"
      | "High"
      | "Critical";
  };

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

  consentMode: {
  status: string;

  implementation: string;

  score: number;

  checks: {
    name: string;

    passed: boolean;
  }[];
};

  detections: {
    id: string;
    provider: string;
    category: string;
  }[];

   trend: {
  current: number;

  previous: number | null;

  change: number;

  trend:
    | "up"
    | "down"
    | "same";

  history: {
    id: string;

    score: number;

    createdAt: string;
  }[];
};

technologyStack: {
  title: string;

  items: string[];
}[];

 findings: {
  id: string;

  title: string;

  recommendation: string;

  severity?: string;

  evidence?: {
    cookie?: string;

    tracker?: string;

    domain?: string;

    secure?: boolean;

    httpOnly?: boolean;

    sameSite?: string;

    rule?: string;
  };
}[];
}

export function ScannerDashboard() {
  const {
    selectedScanId,
    setSelectedScanId,
    refreshKey,
  } = useScanner();

  const progress =
  useScanProgress(
    selectedScanId ??
      undefined
  );

  const [data, setData] =
    useState<SummaryResponse | null>(
      null
    );

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadLatest() {
      const latest =
        await fetch(
          "/api/scanner/latest"
        );

      if (!latest.ok) {
        return;
      }

      const scan =
        await latest.json();

      if (!scan) {
        return;
      }

      setSelectedScanId(
        scan.id
      );
    }

    if (!selectedScanId) {
      loadLatest();
    }
  }, [
    selectedScanId,
    setSelectedScanId,
    refreshKey,
  ]);

  useEffect(() => {
    if (!selectedScanId) {
      return;
    }

    async function loadSummary() {
      try {
        setError(null);

        const response =
          await fetch(
            `/api/scanner/${selectedScanId}`
          );

        if (!response.ok) {
          throw new Error(
            "Failed to load scan."
          );
        }

        const json =
          await response.json();

        setData(json);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unknown error."
        );
      }
    }

    loadSummary();
  }, [
    selectedScanId,
    refreshKey,
  ]);

  if (error) {
    return (
      <ErrorState
        message={error}
      />
    );
  }

  if (!data) {
    return <LoadingState />;
  }

  if (!selectedScanId) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-8">

      <ExecutiveSummaryCard
        title={
          data.executiveSummary.title
        }
        summary={
          data.executiveSummary.summary
        }
        risk={
          data.executiveSummary.risk
        }
      />

      <ChangeSummary
  changes={data.changes}
/>

      <TechnologyStackCard
  technologies={
    data.technologyStack
  }
/>

<ConsentModeCard
  consentMode={
    data.consentMode
  }
/>

      <PrivacyScore
        score={data.dashboard.score}
      />

      {progress &&
  progress.status ===
    "running" && (
    <ProgressCard
      stage={
        progress.stage
      }
      progress={
        progress.progress
      }
      estimatedSeconds={
        progress.estimatedSeconds
      }
    />
)}

      <div className="grid grid-cols-3 gap-4">

  <PrivacyTrend
    {...data.trend}
  />

  <ImprovementCard
    change={
      data.trend.change
    }
  />

  <div className="rounded-xl border p-6">

    <div className="text-sm text-muted-foreground">
      Current Status
    </div>

    <div className="mt-4">
      <StatusChip
        score={
          data.dashboard.score
        }
      />
    </div>

  </div>

</div>

<ScoreHistoryChart
  history={
    data.trend.history
  }
/>

      {selectedScanId && (
  <div className="flex gap-3">
    <DownloadPdfButton
      scanId={selectedScanId}
    />

    <GenerateCookiePolicyButton
      scanId={selectedScanId}
    />
  </div>
)}

      <div className="grid grid-cols-4 gap-4">
        <SummaryCard
          title="Cookies"
          value={
            data.dashboard.cookies
          }
        />

        <SummaryCard
          title="Trackers"
          value={
            data.dashboard.trackers
          }
        />

        <SummaryCard
          title="Findings"
          value={
            data.dashboard.findings
          }
        />

        <SummaryCard
          title="Risk"
          value={
            data.dashboard.risk
          }
        />
      </div>

      <TrackerTable
        trackers={
          data.detections
        }
      />

      <FindingsTable
        findings={
          data.findings
        }
      />

      <HistoryCard />
    </div>
  );
}
